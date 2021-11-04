import _ from 'lodash';
import getenv from 'getenv';
import axios from 'axios';
import Discord from 'discord.js';
import PriceService from './priceService';
/**
 * Just setup a new channel in discord, then go to settings, integrations and created a new webhook
 * Set the webhook URL in the config.json.
 */

export default class DiscordHelper {
  config: any;
  client?: Discord.Client;
  priceService: PriceService;
  constructor(config: any, client?: Discord.Client) {
    this.config = config;
    this.client = client;
    this.priceService = new PriceService();
  }

  async _postEmbed(saleInfo: any) {
    const me = this;
    if (me.client) {
      var solanaPrice = await this.priceService.getSolanaPrice();
      let colorCode = '#64f088';
      let itemId = 0;
      if (getenv.string('HOW_RARE_IS') != null) {
        itemId = +getItemId(saleInfo.nftInfo.name)! ?? 1;
      }
      var salePrice = parseFloat(saleInfo.saleAmount);
      var totalUSD = salePrice * solanaPrice;
      var priceMessage = `${salePrice.toFixed(2)} S\u{25CE}L`;
      if (salePrice >= 9) {
        priceMessage = `${salePrice.toFixed(2)} S\u{25CE}L ($${totalUSD.toFixed(2)})`;
      }
      const embedMsg = new Discord.MessageEmbed()
        .setColor(colorCode)
        .setTitle(`${saleInfo.nftInfo.name} → SOLD`)
        .setURL(saleInfo.assetUrl)
        .addField("Price", priceMessage, false)
        .addField("Seller", `[${saleInfo.seller.slice(0, 8)}](https://nfteyez.global/accounts/${saleInfo.seller})`, true)
        .addField("Buyer", `[${saleInfo.buyer.slice(0, 8)}](https://nfteyez.global/accounts/${saleInfo.buyer})`, true)
        .addField("Mint Token", `${saleInfo.mintPubkey}`)
        .addField("Rarity", `${getenv('HOW_RARE_IS')}${itemId}`)
        .addField("Marketplace", `${saleInfo.marketPlace}`, true)
        .setImage(formatImageUrl(saleInfo.nftInfo.image))
        .setTimestamp();

      me!.client.channels.fetch(getenv('DISCORD_CHANNEL_ID'))
        .then((channel: any) => {
          channel.send(embedMsg);
        })
        .catch(console.error);
    }

  }

  _createWebhookData(saleInfo: any) {
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

  async send(saleInfo: any) {
    const me = this;
    if (getenv('DISCORD_WEBHOOK_URL')) {
      await axios.post(getenv('DISCORD_WEBHOOK_URL'), me._createWebhookData(saleInfo));
    }
    else {
      await me._postEmbed(saleInfo);
    }
  }
}

function getItemId(item: string) {
  let splitStr = item.split('#');
  if (splitStr.length == 1) {
    splitStr = item.split(' ');
  }
  if (parseInt(splitStr[1]) > 0) {
    return splitStr[1];
  }
  return null;
}
function formatImageUrl(imgUrl: string) {
  let splitString = imgUrl.split('?');
  return splitString[0];
}