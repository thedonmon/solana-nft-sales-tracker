"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const cache_1 = __importDefault(require("./cache"));
const ttl = 60; //cache for 60 seconds;
const cache = new cache_1.default(ttl);
class PriceService {
    constructor() {
    }
    async getSolanaPrice() {
        var cachePrice = await cache.get('solPriceUSD', async function () { return await getPrice('solana'); }, 60);
        return cachePrice;
    }
    ;
}
exports.default = PriceService;
;
async function getPrice(symbolId) {
    var solPriceResponse = await axios_1.default.get('https://api.coingecko.com/api/v3/simple/price', {
        params: {
            ids: symbolId,
            vs_currencies: 'usd',
            include_last_updated_at: true
        }
    });
    var solPriceUSD = solPriceResponse?.data[symbolId]?.usd;
    return `${solPriceUSD}`;
}
;
//# sourceMappingURL=priceService.js.map