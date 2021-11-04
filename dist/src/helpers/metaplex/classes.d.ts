import BN from "bn.js";
import { StringPublicKey, MetadataKey, FileOrString, MetadataCategory, MetaplexKey } from "./types.js";
export declare class MasterEditionV1 {
    key: MetadataKey;
    supply: BN;
    maxSupply?: BN;
    printingMint: StringPublicKey;
    oneTimePrintingAuthorizationMint: StringPublicKey;
    constructor(args: {
        key: MetadataKey;
        supply: BN;
        maxSupply?: BN;
        printingMint: StringPublicKey;
        oneTimePrintingAuthorizationMint: StringPublicKey;
    });
}
export declare class MasterEditionV2 {
    key: MetadataKey;
    supply: BN;
    maxSupply?: BN;
    constructor(args: {
        key: MetadataKey;
        supply: BN;
        maxSupply?: BN;
    });
}
export declare class EditionMarker {
    key: MetadataKey;
    ledger: number[];
    constructor(args: {
        key: MetadataKey;
        ledger: number[];
    });
    editionTaken(edition: number): boolean;
}
export declare class Edition {
    key: MetadataKey;
    parent: StringPublicKey;
    edition: BN;
    constructor(args: {
        key: MetadataKey;
        parent: StringPublicKey;
        edition: BN;
    });
}
export declare class Creator {
    address: StringPublicKey;
    verified: boolean;
    share: number;
    constructor(args: {
        address: StringPublicKey;
        verified: boolean;
        share: number;
    });
}
export declare class Data {
    name: string;
    symbol: string;
    uri: string;
    sellerFeeBasisPoints: number;
    creators: Creator[] | null;
    constructor(args: {
        name: string;
        symbol: string;
        uri: string;
        sellerFeeBasisPoints: number;
        creators: Creator[] | null;
    });
}
export declare class Metadata {
    key: MetadataKey;
    updateAuthority: StringPublicKey;
    mint: StringPublicKey;
    data: Data;
    primarySaleHappened: boolean;
    isMutable: boolean;
    editionNonce: number | null;
    constructor(args: {
        updateAuthority: StringPublicKey;
        mint: StringPublicKey;
        data: Data;
        primarySaleHappened: boolean;
        isMutable: boolean;
        editionNonce: number | null;
    });
}
export interface IMetadataExtension {
    name: string;
    symbol: string;
    creators: Creator[] | null;
    description: string;
    image: string;
    animation_url?: string;
    external_url: string;
    seller_fee_basis_points: number;
    properties: {
        files?: FileOrString[];
        category: MetadataCategory;
        maxSupply?: number;
        creators?: {
            address: string;
            shares: number;
        }[];
    };
}
export declare const METADATA_SCHEMA: Map<any, any>;
export declare class WhitelistedCreator {
    key: MetaplexKey;
    address: StringPublicKey;
    activated: boolean;
    twitter?: string;
    name?: string;
    image?: string;
    description?: string;
    constructor(args: {
        address: string;
        activated: boolean;
    });
}
