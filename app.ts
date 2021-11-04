import express from "express";
import getenv from "getenv";
import config from './config/sample.json';
const app = express();
const port = getenv.int('PORT', 5000);
import PriceService from "./src/helpers/priceService";
import SaleTracker from "./src/main";
import Discord, { Client, TextChannel } from 'discord.js';
let discordClient: Discord.Client;
let priceService = new PriceService();
app.get('/', (req, res) => {
  res.send('The bot is running')
});

app.listen(port, () => {
  console.log(`Bot listening at http://localhost:${port}`)
});

if (getenv('DISCORD_BOT_TOKEN', 'null') !== 'null') {
  discordClient = new Client();
  initBot(discordClient);
  let outputType = 'discord_bot';
  console.log('Tracking sales using ', outputType, '...');
  let tracker = new SaleTracker(config, outputType, priceService, discordClient);
  setInterval(async () => {
    await tracker.checkSales();
  }, 30000);

}
else if (getenv('DISCORD_WEBHOOK_URL', 'null') !== 'null') {
  let outputType = 'discord_webhook';
  console.log('Tracking sales using ', outputType, '...');
  let tracker = new SaleTracker(config, outputType, priceService);
  setInterval(async () => {
    await tracker.checkSales();
  }, 30000);
}
else if (getenv("TWITTER_API_KEY", 'null') !== null) {
  let outputType = 'twitter';
  console.log('Tracking sales using ', outputType, '...');
  let tracker = new SaleTracker(config, outputType, priceService);
  setInterval(async () => {
    await tracker.checkSales();
  }, 30000);
}
else {
  let outputType = 'console';
  console.log('Tracking sales using ', outputType, '...');
  let tracker = new SaleTracker(config, outputType, priceService);
  setInterval(async () => {
    await tracker.checkSales();
  }, 30000);
}


async function initBot(client: Client): Promise<TextChannel> {
  return new Promise<TextChannel>((resolve, reject) => {
    ['DISCORD_BOT_TOKEN', 'DISCORD_CHANNEL_ID'].forEach((envVar) => {
      if (!getenv(envVar)) reject(`${envVar} not set`)
    })

    client.login(getenv("DISCORD_BOT_TOKEN"));
    client.on('ready', async () => {
      console.log(`Logged in as ${client?.user?.tag}!`);
      console.log(`Listening to new events for collection ${getenv('COLLECTION_NAME')}`);
      const channel = await client.channels.fetch(getenv("DISCORD_CHANNEL_ID")!);
      resolve(channel as TextChannel);
    });
  })
}