"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const web3_js_1 = require("@solana/web3.js");
const metadata_helpers_1 = require("./helpers/metadata-helpers");
const discord_helper_1 = __importDefault(require("./helpers/discord-helper"));
const twitter_helper_1 = __importDefault(require("./helpers/twitter-helper"));
const lodash_1 = __importDefault(require("lodash"));
const axios_1 = __importDefault(require("axios"));
const fs_1 = __importDefault(require("fs"));
const jsoning_1 = __importDefault(require("jsoning"));
let db = new jsoning_1.default('signatureMarker.json');
class SaleTracker {
    config;
    connection;
    auditFilePath;
    outputType;
    constructor(config, outputType) {
        this.config = config;
        this.connection = new web3_js_1.Connection(this.config.rpc);
        this.auditFilePath = `./auditfile-${outputType}.json`;
        this.outputType = outputType;
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
        const confirmedSignatures = await this.connection.getConfirmedSignaturesForAddress2(new web3_js_1.PublicKey(me.config.primaryRoyaltiesAccount), options);
        if (!confirmedSignatures || confirmedSignatures.length == 0) {
            console.log("No new txns..");
            return;
        }
        const latestSignature = confirmedSignatures[0].signature;
        if (options.until) {
            lodash_1.default.remove(confirmedSignatures, (tx) => {
                return options.until?.includes(tx.signature);
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
                send: async function (saleInfo) {
                    console.log(JSON.stringify(saleInfo), null, 2);
                }
            };
        }
        if (me.outputType === 'discord') {
            return new discord_helper_1.default(me.config);
        }
        else {
            return new twitter_helper_1.default(me.config);
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
    async _getAndFormatOptions() {
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
    _readOrCreateAuditFile() {
        const me = this;
        if (fs_1.default.existsSync(me.auditFilePath)) {
            return JSON.parse(fs_1.default.readFileSync(me.auditFilePath).toString());
        }
        else {
            fs_1.default.writeFileSync(me.auditFilePath, me._getNewAuditFileStructure());
            return JSON.parse(fs_1.default.readFileSync(me.auditFilePath).toString());
        }
    }
    /**
     * Keeping it simple. Using a file to track processed signatures. Routinely trimming
     * signatures from the file to keep size in check.
     * Improvement: Use a database to store the processed file information - helpes with easier deployment since in the current scheme the lock file is part of the commit.
     * @param signature
     */
    async _updateLockFile(signature) {
        const me = this;
        let file = me._readOrCreateAuditFile();
        file.processedSignatures[0] = signature;
        if (file.processedSignatures.length > 300) {
            file.processedSignatures = lodash_1.default.takeRight(file.processedSignatures, 10);
        }
        await fs_1.default.writeFileSync(me.auditFilePath, JSON.stringify(file));
    }
    /**
     * Gets the mint metadata using the metaplex helper classes.
     * @param mintInfo
     * @returns
     */
    async _getMintMetadata(mintInfo) {
        const me = this;
        let metadata = await (0, metadata_helpers_1.getMetadata)(new web3_js_1.PublicKey(mintInfo), me.config.rpc);
        return metadata;
    }
    /**
     * Identifies the marketplace using the addresses asssociated with the transaction.
     * The marketplaces have their own royalty addresses which are credited as part of the sale.
     * @param addresses
     * @returns
     */
    _mapMarketPlace(addresses) {
        const me = this;
        let marketPlace = {};
        lodash_1.default.forEach(me.config.marketPlaceInfos, (mpInfo) => {
            if (lodash_1.default.size(lodash_1.default.intersection(addresses, mpInfo.addresses)) > 0) {
                marketPlace.name = mpInfo.name;
                marketPlace.mintUrl = mpInfo.assetUrl;
                return false;
            }
        });
        return marketPlace;
    }
    /**
     * The amount debited from the buyer is the actual amount paid for the NFT.
     * @param accountPostBalances - Map of account addresses and the balances post this transaction
     * @param buyer - The buyer address
     * @returns
     */
    _getSaleAmount(accountPostBalances, accountPreBalances, buyer) {
        return lodash_1.default.round(Math.abs(accountPostBalances[buyer] - accountPreBalances[buyer]) / Math.pow(10, 9), 2).toFixed(2);
    }
    /**
     * Some basic ways to avoid people sending fake transactions to our primaryRoyaltiesAccount in an attempt
     * to appear on the sale bots result.
     * @param mintMetadata
     * @returns
     */
    _verifyNFT(mintMetadata) {
        const me = this;
        let creators = lodash_1.default.map(mintMetadata.data.creators, 'address');
        let updateAuthority = lodash_1.default.get(mintMetadata, `updateAuthority`);
        return lodash_1.default.includes(creators, me.config.primaryRoyaltiesAccount) && updateAuthority === me.config.updateAuthority;
    }
    /**
     * Get the detailed transaction info, compute account balance changes, identify the marketplaces involved
     * Get the sale amount, get the NFT information from the transaction and thenr retrieve the image from
     * ARWeave.
     * @param signature
     * @returns saleInfo object
     */
    async _parseTransactionForSaleInfo(signature) {
        const me = this;
        let transactionInfo = await me.connection.getTransaction(signature);
        let accountKeys = transactionInfo?.transaction.message.accountKeys;
        let accountMap = [];
        if (accountKeys) {
            let idx = 0;
            for (let accountKey of accountKeys) {
                accountMap[idx++] = accountKey.toBase58();
            }
        }
        let allAddresses = lodash_1.default.values(accountMap);
        let buyer = accountMap[0];
        let { balanceDifferences, seller, mintInfo, saleAmount, marketPlace } = me._parseTransactionMeta(transactionInfo, accountMap, buyer, allAddresses);
        if (balanceDifferences && balanceDifferences[me.config.primaryRoyaltiesAccount] > 0 && !lodash_1.default.isEmpty(marketPlace)) {
            let mintMetaData = await me._getMintMetadata(mintInfo);
            if (!me._verifyNFT(mintMetaData)) {
                console.log("Not an NFT transaction that we're interested in", mintMetaData);
                return;
            }
            let arWeaveUri = lodash_1.default.get(mintMetaData, `data.uri`);
            let arWeaveInfo = await axios_1.default.get(arWeaveUri);
            return {
                time: transactionInfo?.blockTime,
                txSignature: signature,
                marketPlace: marketPlace.name ? marketPlace.name : 'Unknown',
                assetUrl: marketPlace.mintUrl ? marketPlace.mintUrl : null,
                buyer,
                seller,
                saleAmount,
                nftInfo: {
                    id: lodash_1.default.get(mintMetaData, `data.name`),
                    name: lodash_1.default.get(mintMetaData, `data.name`),
                    image: arWeaveInfo.data.image
                }
            };
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
    _parseTransactionMeta(transactionInfo, accountMap, buyer, allAddresses) {
        const me = this;
        let txMetadata = transactionInfo.meta, mintInfo = lodash_1.default.get(txMetadata, `postTokenBalances.0.mint`), balanceDifferences = {}, seller = '';
        let accountPreBalances = {};
        let accountPostBalances = {};
        lodash_1.default.forEach(txMetadata.preBalances, (balance, index) => {
            accountPreBalances[accountMap[index]] = balance;
        });
        lodash_1.default.forEach(txMetadata.postBalances, (balance, index) => {
            accountPostBalances[accountMap[index]] = balance;
        });
        let largestBalanceIncrease = 0;
        lodash_1.default.forEach(accountPostBalances, (balance, address) => {
            let balanceIncrease = accountPostBalances[address] - accountPreBalances[address];
            balanceDifferences[address] = balanceIncrease;
            if (balanceIncrease > largestBalanceIncrease) {
                seller = address;
                largestBalanceIncrease = balanceIncrease;
            }
        });
        let marketPlaceInfo = me._mapMarketPlace(allAddresses);
        if (marketPlaceInfo.mintUrl !== null) {
            marketPlaceInfo.mintUrl = `${marketPlaceInfo.mintUrl}${lodash_1.default.get(txMetadata, `postTokenBalances.0.mint`)}`;
        }
        else {
            marketPlaceInfo.mintUrl = `https://solscan.io/token/${lodash_1.default.get(txMetadata, `postTokenBalances.0.mint`)}`;
        }
        return {
            accountPreBalances,
            accountPostBalances,
            balanceDifferences,
            seller,
            mintInfo,
            marketPlace: marketPlaceInfo,
            saleAmount: me._getSaleAmount(accountPostBalances, accountPreBalances, buyer)
        };
    }
}
exports.default = SaleTracker;
//# sourceMappingURL=main.js.map