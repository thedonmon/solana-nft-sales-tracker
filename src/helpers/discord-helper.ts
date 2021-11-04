import _ from 'lodash';
import getenv from 'getenv';
import axios from 'axios';
/**
 * Just setup a new channel in discord, then go to settings, integrations and created a new webhook
 * Set the webhook URL in the config.json.
 */

export default class DiscordHelper {
  config: any;
  constructor(config:any){
    this.config = config;
  }

  _createWebhookData(saleInfo:any) {
    const botName = getenv('BOT_NAME', "NFTBot");
    const botAuthor = getenv('BOT_AUTHORT', "NFTBot");
    return {
      "username": botName,
      "embeds": [
        {
          "author": {
            "name": botAuthor
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
    }
  }
  
  async send(saleInfo:any) {
    const me = this;
    await axios.post(this.config.discord.webhookUrl, me._createWebhookData(saleInfo));
  }
}
