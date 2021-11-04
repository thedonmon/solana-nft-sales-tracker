import axios from 'axios';
import CacheService from './cache';

const ttl = 60; //cache for 60 seconds;
const cache = new CacheService(ttl);

export default class PriceService {

    constructor() {
    }

    async getSolanaPrice() {
        var cachePrice = await cache.get('solPriceUSD', async function(){ return await getPrice('solana'); }, 60);
        return cachePrice;
    };


};

async function getPrice(symbolId: string): Promise<string> {
    var solPriceResponse = await axios.get<any>('https://api.coingecko.com/api/v3/simple/price', {
        params: {
            ids: symbolId,
            vs_currencies: 'usd',
            include_last_updated_at: true
        }
    });
    var solPriceUSD = solPriceResponse?.data[symbolId]?.usd;
    return `${solPriceUSD}`;
};

