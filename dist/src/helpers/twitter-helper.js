"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const twitter_1 = __importDefault(require("twitter"));
const getenv_1 = __importDefault(require("getenv"));
/**
 * Twitter uses 3 legged oAuth for certain endpoints.
 * You can get the oauth key and secret by simulating the API calls yourselves.
 * You need a approved developer account.
 */
class TwitterHelper {
    config;
    client;
    constructor(config) {
        this.config = config;
        this.client = new twitter_1.default({
            consumer_key: getenv_1.default.string('TWITTER_API_KEY'),
            consumer_secret: getenv_1.default.string('TWITTER_API_SECRET'),
            access_token_key: getenv_1.default.string('TWITTER_API_KEY'),
            access_token_secret: getenv_1.default.string('TWITTER_ACCESS_SECRET')
        });
    }
    /**
     * Downloads image from a URL and returns it in Base64 format.
     * @param url
     * @returns
     */
    getBase64(url) {
        return axios_1.default.get(url, {
            responseType: 'arraybuffer'
        }).then(response => Buffer.from(response.data, 'binary').toString('base64'));
    }
    /**
     * Format your tweet, you can use emojis.
     * @param saleInfo
     * @returns
     */
    formatTweet(saleInfo) {
        let tweetstr = `
    ${saleInfo.nftInfo.id} purchased for ${saleInfo.saleAmount} S◎L 
    Marketplace: ${saleInfo.marketPlace.name}

    ${this.config.twitterHashtags}
  
    Explorer: https://explorer.solana.com/tx/${saleInfo.txSignature}
      `;
        if (saleInfo.marketPlace.assetUrl !== null) {
            tweetstr = `
      ${saleInfo.nftInfo.id} purchased for ${saleInfo.saleAmount} S◎L 
      Marketplace: ${saleInfo.marketPlace.name}
      ${saleInfo.marketPlace.assetUrl}
    
      ${this.config.twitterHashtags}
    
      Explorer: https://solscan.io/tx/${saleInfo.txSignature}
        `;
        }
        return {
            status: tweetstr
        };
    }
    /**
     * Creates a formatted tweet, uploads the NFT image to twitter and then posts a status update.
     * @param saleInfo
     */
    async send(saleInfo) {
        const me = this;
        let tweetInfo = me.formatTweet(saleInfo);
        let image = await me.getBase64(`${saleInfo.nftInfo.image}`);
        let mediaUpload;
        try {
            mediaUpload = await me.client.post('media/upload', { media_data: image });
        }
        catch (err) {
            console.log(JSON.stringify(err));
            throw err;
        }
        await me.client.post('statuses/update.json', { status: tweetInfo.status, media_ids: mediaUpload.media_id_string });
    }
}
exports.default = TwitterHelper;
//# sourceMappingURL=twitter-helper.js.map