"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
/**
 * Just setup a new channel in discord, then go to settings, integrations and created a new webhook
 * Set the webhook URL in the config.json.
 */
class DiscordHelper {
    config;
    constructor(config) {
        this.config = config;
    }
    _createWebhookData(saleInfo) {
        return {
            "username": "Flutter Sales Bot",
            "embeds": [
                {
                    "author": {
                        "name": "Flutter Sales Bot"
                    },
                    "fields": [
                        {
                            "name": "Price",
                            "value": saleInfo.saleAmount
                        },
                        {
                            "name": "Seller",
                            "value": saleInfo.seller,
                            "inline": true
                        },
                        {
                            "name": "Buyer",
                            "value": saleInfo.buyer,
                            "inline": true
                        },
                        {
                            "name": "Transaction ID",
                            "value": saleInfo.txSignature,
                            "inline": false
                        },
                        {
                            "name": "Marketplace",
                            "value": saleInfo.marketPlace,
                            "inline": false
                        }
                    ],
                    "color": 14303591,
                    "title": `${saleInfo.nftInfo.id} → SOLD`,
                    "url": `https://explorer.solana.com/tx/${saleInfo.txSignature}`,
                    "thumbnail": {
                        "url": `${saleInfo.nftInfo.image}`
                    },
                    "timestamp": new Date(saleInfo.time * 1000).toISOString()
                }
            ]
        };
    }
    async send(saleInfo) {
        const me = this;
        await axios_1.default.post(this.config.discord.webhookUrl, me._createWebhookData(saleInfo));
    }
}
exports.default = DiscordHelper;
//# sourceMappingURL=discord-helper.js.map