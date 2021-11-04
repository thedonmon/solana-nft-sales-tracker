import { Connection, PublicKey, ConfirmedSignatureInfo, ConfirmedSignaturesForAddress2Options } from "@solana/web3.js";
import { getMetadata } from './helpers/metadata-helpers'
import DiscordHelper from './helpers/discord-helper'
import TwitterHelper from './helpers/twitter-helper'


import _ from 'lodash';
import axios from 'axios'
import fs from 'fs';
import Jsoning from "jsoning";
import { string } from "yargs";
import Marketplace from "./models/marketplace";
import Discord from "discord.js";
import PriceService from "./helpers/priceService";
let db = new Jsoning('signatureMarker.json');

export default class SaleTracker {
  config: any
  connection: Connection;
  auditFilePath: string;
  outputType: string;
  priceService: PriceService;
  discordClient?: Discord.Client;
  constructor(config: any, outputType: string, priceService: PriceService, discordClient?: Discord.Client) {
    this.config = config;
    this.connection = new Connection(this.config.rpc);
    this.auditFilePath = `./auditfile-${outputType}.json`;
    this.outputType = outputType;
    this.priceService = priceService;
    this.discordClient = discordClient;
  }

  /**
   * The main function.
   */
  async checkSales() {
    const me = this;
    //let lockFile = me._readOrCreateAuditFile();
    let options = await me._getAndFormatOptions();
    //let lastProcessedSignature = _.last(lockFile.processedSignatures);
    console.log("Started");
    const confirmedSignatures: ConfirmedSignatureInfo[] = await this.connection.getConfirmedSignaturesForAddress2(new PublicKey(me.config.primaryRoyaltiesAccount), options);
    if (!confirmedSignatures || confirmedSignatures.length == 0) {
      console.log("No new txns..");
      return;
    }
    const latestSignature = confirmedSignatures[0].signature;
    if (options.until) {
      _.remove(confirmedSignatures, (tx: any) => {
        return options.until?.includes(tx.signature)
      });
    }
    console.log("Got transactions", confirmedSignatures.length);

    for (let confirmedSignature of confirmedSignatures) {
      let saleInfo = await me._parseTransactionForSaleInfo(confirmedSignature.signature);
      if (saleInfo) {
        await me._getOutputPlugin().send(saleInfo);
      }
    }
    console.log("Updated lockfile", latestSignature);
    await db.set("lastSignature", latestSignature);
    //await me._updateLockFile(latestSignature);

    console.log("Done");
  }

  /**
   * A basic factory to return the output plugin.
   * @returns 
   */
  _getOutputPlugin() {
    const me = this;
    if (me.outputType === 'console') {
      return {
        send: async function (saleInfo: any) {
          console.log(JSON.stringify(saleInfo), null, 2);
        }
      }
    }
    if (me.outputType === 'discord_webhook') {
      return new DiscordHelper(me.config);
    }
    else if (me.outputType === 'discord_bot'){
      return new DiscordHelper(me.config, me.discordClient)
    } 
    else {
      return new TwitterHelper(me.config);
    }
  }

  /**
   * Returns a dummy audit file for first run.
   * @returns 
   */
  _getNewAuditFileStructure() {
    return JSON.stringify({
      processedSignatures: []
    });
  }

  async _getAndFormatOptions(): Promise<ConfirmedSignaturesForAddress2Options> {
    let lastSignature = await db.get("lastSignature");
    if (lastSignature) {
      return { limit: 25, until: lastSignature };
    }
    return { limit: 25 };
  }
  /**
   * Returns the auditfile if it exists, if not createss a new empty one.
   * @returns The contents of the auditfile.
   */
  _readOrCreateAuditFile(): { processedSignatures: string[] } {
    const me = this;
    if (fs.existsSync(me.auditFilePath)) {
      return JSON.parse(fs.readFileSync(me.auditFilePath).toString());
    } else {
      fs.writeFileSync(me.auditFilePath, me._getNewAuditFileStructure());
      return JSON.parse(fs.readFileSync(me.auditFilePath).toString());
    }
  }

  /**
   * Keeping it simple. Using a file to track processed signatures. Routinely trimming
   * signatures from the file to keep size in check.
   * Improvement: Use a database to store the processed file information - helpes with easier deployment since in the current scheme the lock file is part of the commit.
   * @param signature 
   */
  async _updateLockFile(signature: string) {
    const me = this;
    let file = me._readOrCreateAuditFile();
    file.processedSignatures[0] = signature;
    if (file.processedSignatures.length > 300) {
      file.processedSignatures = _.takeRight(file.processedSignatures, 10);
    }
    await fs.writeFileSync(me.auditFilePath, JSON.stringify(file));
  }

  /**
   * Gets the mint metadata using the metaplex helper classes.
   * @param mintInfo 
   * @returns 
   */
  async _getMintMetadata(mintInfo: PublicKey) {
    const me = this;
    let metadata = await getMetadata(new PublicKey(mintInfo), me.config.rpc);
    return metadata
  }

  /**
   * Identifies the marketplace using the addresses asssociated with the transaction.
   * The marketplaces have their own royalty addresses which are credited as part of the sale.
   * @param addresses 
   * @returns 
   */
  _mapMarketPlace(addresses: string[]): Marketplace {
    const me = this;
    let marketPlace: Marketplace = {} as Marketplace;
    _.forEach(me.config.marketPlaceInfos, (mpInfo: any) => {
      if (_.size(_.intersection(addresses, mpInfo.addresses)) > 0) {
        marketPlace.name = mpInfo.name;
        marketPlace.mintUrl = mpInfo.assetUrl;
        return false;
      }
    })
    return marketPlace;
  }

  /**
   * The amount debited from the buyer is the actual amount paid for the NFT.
   * @param accountPostBalances - Map of account addresses and the balances post this transaction
   * @param buyer - The buyer address
   * @returns 
   */
  _getSaleAmount(accountPostBalances: { [key: string]: number }, accountPreBalances: { [key: string]: number }, buyer: string): string {
    return _.round(Math.abs(accountPostBalances[buyer] - accountPreBalances[buyer]) / Math.pow(10, 9), 2).toFixed(2);
  }

  /**
   * Some basic ways to avoid people sending fake transactions to our primaryRoyaltiesAccount in an attempt
   * to appear on the sale bots result.
   * @param mintMetadata 
   * @returns 
   */
  _verifyNFT(mintMetadata: any) {
    const me = this;
    let creators = _.map(mintMetadata.data.creators, 'address');
    let updateAuthority = _.get(mintMetadata, `updateAuthority`);
    return _.includes(creators, me.config.primaryRoyaltiesAccount) && updateAuthority === me.config.updateAuthority;
  }

  /**
   * Get the detailed transaction info, compute account balance changes, identify the marketplaces involved
   * Get the sale amount, get the NFT information from the transaction and thenr retrieve the image from
   * ARWeave.
   * @param signature 
   * @returns saleInfo object
   */
  async _parseTransactionForSaleInfo(signature: string) {
    const me = this;
    let transactionInfo = await me.connection.getTransaction(signature);
    let accountKeys = transactionInfo?.transaction.message.accountKeys;
    let accountMap: { [key: number]: string } = [];
    if (accountKeys) {
      let idx = 0;
      for (let accountKey of accountKeys) {
        accountMap[idx++] = accountKey.toBase58();
      }
    }
    let allAddresses = _.values(accountMap);
    let buyer = accountMap[0];
    let {
      balanceDifferences,
      seller,
      mintInfo,
      saleAmount,
      marketPlace,
      mintPubkey
    } = me._parseTransactionMeta(transactionInfo, accountMap, buyer, allAddresses);

    if (balanceDifferences && balanceDifferences[me.config.primaryRoyaltiesAccount] > 0 && !_.isEmpty(marketPlace)) {
      let mintMetaData = await me._getMintMetadata(mintInfo);
      if (!me._verifyNFT(mintMetaData)) {
        console.log("Not an NFT transaction that we're interested in", mintMetaData);
        return;
      }
      let arWeaveUri = _.get(mintMetaData, `data.uri`);
      let arWeaveInfo: any = await axios.get(arWeaveUri);
      return {
        time: transactionInfo?.blockTime,
        txSignature: signature,
        marketPlace: marketPlace.name ? marketPlace.name : 'Unknown',
        assetUrl: marketPlace.mintUrl ? marketPlace.mintUrl : null,
        buyer,
        seller,
        saleAmount,
        mintPubkey,
        nftInfo: {
          id: _.get(mintMetaData, `data.name`),
          name: _.get(mintMetaData, `data.name`),
          image: arWeaveInfo.data.image
        }
      }
    }
  }

  /**
   * Some rudimentary logic to compute account balance changes. Assumes that the
   * account which is credited the largest amount is the account of the seller.
   * @param transactionInfo 
   * @param accountMap 
   * @param buyer 
   * @param allAddresses 
   * @returns 
   */
  _parseTransactionMeta(transactionInfo: any, accountMap: { [key: number]: string }, buyer: string, allAddresses: string[]) {
    const me = this;
    let txMetadata = transactionInfo.meta, mintInfo = _.get(txMetadata, `postTokenBalances.0.mint`), balanceDifferences: { [key: string]: number } = {}, seller: string = '';
    let accountPreBalances: { [key: string]: number } = {};
    let accountPostBalances: { [key: string]: number } = {};
    _.forEach(txMetadata.preBalances, (balance: number, index: number) => {
      accountPreBalances[accountMap[index]] = balance;
    });
    _.forEach(txMetadata.postBalances, (balance: number, index: number) => {
      accountPostBalances[accountMap[index]] = balance;
    });

    let largestBalanceIncrease: number = 0;
    _.forEach(accountPostBalances, (balance: Number, address: string) => {
      let balanceIncrease: number = accountPostBalances[address] - accountPreBalances[address];
      balanceDifferences[address] = balanceIncrease;
      if (balanceIncrease > largestBalanceIncrease) {
        seller = address;
        largestBalanceIncrease = balanceIncrease;
      }
    });
    let marketPlaceInfo = me._mapMarketPlace(allAddresses);
    if (marketPlaceInfo.mintUrl && marketPlaceInfo.mintUrl != null) {
      marketPlaceInfo.mintUrl = `${marketPlaceInfo.mintUrl}${_.get(txMetadata, `postTokenBalances.0.mint`)}`;
    }
    else {
      marketPlaceInfo.mintUrl = `https://solscan.io/token/${_.get(txMetadata, `postTokenBalances.0.mint`)}`;
    }
    return {
      accountPreBalances,
      accountPostBalances,
      balanceDifferences,
      seller,
      mintInfo,
      marketPlace: marketPlaceInfo,
      mintPubkey: _.get(txMetadata, `postTokenBalances.0.mint`),
      saleAmount: me._getSaleAmount(accountPostBalances, accountPreBalances, buyer)
    }
  }
}