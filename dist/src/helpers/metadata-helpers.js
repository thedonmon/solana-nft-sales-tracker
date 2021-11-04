"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMetadata = exports.programIds = void 0;
const web3_js_1 = require("@solana/web3.js");
const classes_js_1 = require("./metaplex/classes.js");
const types_js_1 = require("./metaplex/types.js");
const borsh_1 = require("borsh");
// @ts-ignore
const bs58_1 = __importDefault(require("bs58"));
const ids_js_1 = require("./metaplex/ids.js");
const TOKEN_PROGRAM_ID = new web3_js_1.PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
let STORE;
const programIds = () => {
    return {
        token: TOKEN_PROGRAM_ID,
        associatedToken: ids_js_1.SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
        bpf_upgrade_loader: ids_js_1.BPF_UPGRADE_LOADER_ID,
        system: ids_js_1.SYSTEM,
        metadata: ids_js_1.METADATA_PROGRAM_ID,
        memo: ids_js_1.MEMO_ID,
        vault: ids_js_1.VAULT_ID,
        auction: ids_js_1.AUCTION_ID,
        metaplex: ids_js_1.METAPLEX_ID,
        store: STORE,
    };
};
exports.programIds = programIds;
async function getMetadata(pubkey, url) {
    const connection = new web3_js_1.Connection(url, "confirmed");
    const metadataKey = await generatePDA(pubkey);
    const accountInfo = await connection.getAccountInfo((0, ids_js_1.toPublicKey)(metadataKey));
    if (accountInfo && accountInfo.data.length > 0) {
        if (!isMetadataAccount(accountInfo))
            return;
        if (isMetadataV1Account(accountInfo)) {
            const metadata = decodeMetadata(accountInfo.data);
            if (isValidHttpUrl(metadata.data.uri)) {
                return metadata;
            }
        }
    }
}
exports.getMetadata = getMetadata;
async function generatePDA(tokenMint, addEditionToSeeds = false) {
    const PROGRAM_IDS = (0, exports.programIds)();
    const metadataSeeds = [
        Buffer.from(types_js_1.METADATA_PREFIX),
        (0, ids_js_1.toPublicKey)(PROGRAM_IDS.metadata).toBuffer(),
        tokenMint.toBuffer(),
    ];
    if (addEditionToSeeds) {
        metadataSeeds.push(Buffer.from("edition"));
    }
    return (await web3_js_1.PublicKey.findProgramAddress(metadataSeeds, (0, ids_js_1.toPublicKey)(PROGRAM_IDS.metadata)))[0];
}
const decodeMetadata = (buffer) => {
    const metadata = (0, borsh_1.deserializeUnchecked)(classes_js_1.METADATA_SCHEMA, classes_js_1.Metadata, buffer);
    // Remove any trailing null characters from the deserialized strings
    metadata.data.name = metadata.data.name.replace(/\0/g, "");
    metadata.data.symbol = metadata.data.symbol.replace(/\0/g, "");
    metadata.data.uri = metadata.data.uri.replace(/\0/g, "");
    metadata.data.name = metadata.data.name.replace(/\0/g, "");
    return metadata;
};
const isMetadataAccount = (account) => account.owner.toBase58() === ids_js_1.METADATA_PROGRAM_ID;
const isMetadataV1Account = (account) => account.data[0] === types_js_1.MetadataKey.MetadataV1;
function isValidHttpUrl(text) {
    try {
        return text.startsWith('http://') || text.startsWith('https://');
    }
    catch (err) {
        return false;
    }
}
// Required to properly serialize and deserialize pubKeyAsString types
const extendBorsh = () => {
    borsh_1.BinaryReader.prototype.readPubkey = function () {
        const reader = this;
        const array = reader.readFixedArray(32);
        return new web3_js_1.PublicKey(array);
    };
    borsh_1.BinaryWriter.prototype.writePubkey = function (value) {
        const writer = this;
        writer.writeFixedArray(value.toBuffer());
    };
    borsh_1.BinaryReader.prototype.readPubkeyAsString = function () {
        const reader = this;
        const array = reader.readFixedArray(32);
        return bs58_1.default.encode(array);
    };
    borsh_1.BinaryWriter.prototype.writePubkeyAsString = function (value) {
        const writer = this;
        writer.writeFixedArray(bs58_1.default.decode(value));
    };
};
extendBorsh();
//# sourceMappingURL=metadata-helpers.js.map