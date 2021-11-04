import { Connection, PublicKey, ConfirmedSignaturesForAddress2Options } from "@solana/web3.js";
import DiscordHelper from './helpers/discord-helper';
import TwitterHelper from './helpers/twitter-helper';
import Marketplace from "./models/marketplace";
export default class SaleTracker {
    config: any;
    connection: Connection;
    auditFilePath: string;
    outputType: string;
    constructor(config: any, outputType: string);
    /**
     * The main function.
     */
    checkSales(): Promise<void>;
    /**
     * A basic factory to return the output plugin.
     * @returns
     */
    _getOutputPlugin(): DiscordHelper | TwitterHelper | {
        send: (saleInfo: any) => Promise<void>;
    };
    /**
     * Returns a dummy audit file for first run.
     * @returns
     */
    _getNewAuditFileStructure(): string;
    _getAndFormatOptions(): Promise<ConfirmedSignaturesForAddress2Options>;
    /**
     * Returns the auditfile if it exists, if not createss a new empty one.
     * @returns The contents of the auditfile.
     */
    _readOrCreateAuditFile(): {
        processedSignatures: string[];
    };
    /**
     * Keeping it simple. Using a file to track processed signatures. Routinely trimming
     * signatures from the file to keep size in check.
     * Improvement: Use a database to store the processed file information - helpes with easier deployment since in the current scheme the lock file is part of the commit.
     * @param signature
     */
    _updateLockFile(signature: string): Promise<void>;
    /**
     * Gets the mint metadata using the metaplex helper classes.
     * @param mintInfo
     * @returns
     */
    _getMintMetadata(mintInfo: PublicKey): Promise<import("./helpers/metaplex/classes").Metadata | undefined>;
    /**
     * Identifies the marketplace using the addresses asssociated with the transaction.
     * The marketplaces have their own royalty addresses which are credited as part of the sale.
     * @param addresses
     * @returns
     */
    _mapMarketPlace(addresses: string[]): Marketplace;
    /**
     * The amount debited from the buyer is the actual amount paid for the NFT.
     * @param accountPostBalances - Map of account addresses and the balances post this transaction
     * @param buyer - The buyer address
     * @returns
     */
    _getSaleAmount(accountPostBalances: {
        [key: string]: number;
    }, accountPreBalances: {
        [key: string]: number;
    }, buyer: string): string;
    /**
     * Some basic ways to avoid people sending fake transactions to our primaryRoyaltiesAccount in an attempt
     * to appear on the sale bots result.
     * @param mintMetadata
     * @returns
     */
    _verifyNFT(mintMetadata: any): boolean;
    /**
     * Get the detailed transaction info, compute account balance changes, identify the marketplaces involved
     * Get the sale amount, get the NFT information from the transaction and thenr retrieve the image from
     * ARWeave.
     * @param signature
     * @returns saleInfo object
     */
    _parseTransactionForSaleInfo(signature: string): Promise<{
        time: number | null | undefined;
        txSignature: string;
        marketPlace: string;
        assetUrl: string | null;
        buyer: string;
        seller: string;
        saleAmount: string;
        nftInfo: {
            id: any;
            name: any;
            image: any;
        };
    } | undefined>;
    /**
     * Some rudimentary logic to compute account balance changes. Assumes that the
     * account which is credited the largest amount is the account of the seller.
     * @param transactionInfo
     * @param accountMap
     * @param buyer
     * @param allAddresses
     * @returns
     */
    _parseTransactionMeta(transactionInfo: any, accountMap: {
        [key: number]: string;
    }, buyer: string, allAddresses: string[]): {
        accountPreBalances: {
            [key: string]: number;
        };
        accountPostBalances: {
            [key: string]: number;
        };
        balanceDifferences: {
            [key: string]: number;
        };
        seller: string;
        mintInfo: any;
        marketPlace: Marketplace;
        saleAmount: string;
    };
}
