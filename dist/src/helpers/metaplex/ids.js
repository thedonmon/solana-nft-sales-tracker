"use strict";
/*
    Taken from: https://github.com/metaplex-foundation/metaplex/blob/master/js/packages/common/src/utils/ids.ts
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.SYSTEM = exports.METAPLEX_ID = exports.AUCTION_ID = exports.VAULT_ID = exports.METADATA_PROGRAM_ID = exports.MEMO_ID = exports.BPF_UPGRADE_LOADER_ID = exports.SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID = exports.toPublicKey = exports.LazyAccountInfoProxy = void 0;
const web3_js_1 = require("@solana/web3.js");
class LazyAccountInfoProxy {
    executable = false;
    owner = "";
    lamports = 0;
    get data() {
        //
        return undefined;
    }
}
exports.LazyAccountInfoProxy = LazyAccountInfoProxy;
const PubKeysInternedMap = new Map();
const toPublicKey = (key) => {
    if (typeof key !== "string") {
        return key;
    }
    let result = PubKeysInternedMap.get(key);
    if (!result) {
        result = new web3_js_1.PublicKey(key);
        PubKeysInternedMap.set(key, result);
    }
    return result;
};
exports.toPublicKey = toPublicKey;
exports.SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID = new web3_js_1.PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL");
exports.BPF_UPGRADE_LOADER_ID = new web3_js_1.PublicKey("BPFLoaderUpgradeab1e11111111111111111111111");
exports.MEMO_ID = new web3_js_1.PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");
exports.METADATA_PROGRAM_ID = "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s";
exports.VAULT_ID = "vau1zxA2LbssAUEF7Gpw91zMM1LvXrvpzJtmZ58rPsn";
exports.AUCTION_ID = "auctxRXPeJoc4817jDhf4HbjnhEcr1cCXenosMhK5R8";
exports.METAPLEX_ID = "p1exdMJcjVao65QdewkaZRUnU6VPSXhus9n2GzWfh98";
exports.SYSTEM = new web3_js_1.PublicKey("11111111111111111111111111111111");
//# sourceMappingURL=ids.js.map