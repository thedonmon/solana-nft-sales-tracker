export declare type StringPublicKey = string;
export declare const EDITION = "edition";
export declare const METADATA_PREFIX = "metadata";
export declare const MAX_AUCTION_DATA_EXTENDED_SIZE: number;
export declare const MAX_NAME_LENGTH = 32;
export declare const MAX_SYMBOL_LENGTH = 10;
export declare const MAX_URI_LENGTH = 200;
export declare const MAX_CREATOR_LIMIT = 5;
export declare const EDITION_MARKER_BIT_SIZE = 248;
export declare const MAX_CREATOR_LEN: number;
export declare const MAX_METADATA_LEN: number;
export declare enum MetadataKey {
    Uninitialized = 0,
    MetadataV1 = 4,
    EditionV1 = 1,
    MasterEditionV1 = 2,
    MasterEditionV2 = 6,
    EditionMarker = 7
}
export declare enum MetadataCategory {
    Audio = "audio",
    Video = "video",
    Image = "image",
    VR = "vr",
    HTML = "html"
}
export declare type MetadataFile = {
    uri: string;
    type: string;
};
export declare type FileOrString = MetadataFile | string;
export interface Auction {
    name: string;
    auctionerName: string;
    auctionerLink: string;
    highestBid: number;
    solAmt: number;
    link: string;
    image: string;
}
export interface Artist {
    address?: string;
    name: string;
    link: string;
    image: string;
    itemsAvailable?: number;
    itemsSold?: number;
    about?: string;
    verified?: boolean;
    share?: number;
}
export declare enum ArtType {
    Master = 0,
    Print = 1,
    NFT = 2
}
export interface Art {
    url: string;
}
export declare enum MetaplexKey {
    Uninitialized = 0,
    OriginalAuthorityLookupV1 = 1,
    BidRedemptionTicketV1 = 2,
    StoreV1 = 3,
    WhitelistedCreatorV1 = 4,
    PayoutTicketV1 = 5,
    SafetyDepositValidationTicketV1 = 6,
    AuctionManagerV1 = 7,
    PrizeTrackingTicketV1 = 8,
    SafetyDepositConfigV1 = 9,
    AuctionManagerV2 = 10,
    BidRedemptionTicketV2 = 11,
    AuctionWinnerTokenTypeTrackerV1 = 12
}
