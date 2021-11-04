import express from "express";
import getenv from "getenv";
import config from './config/sample.json';
const app = express();
const port = getenv.int('PORT', 5000);
import SaleTracker from "./src/main";
import { Client, TextChannel } from 'discord.js';

if(getenv('DISCORD_BOT_TOKEN', 'null') !== 'null'){
    const client = new Client();
    initBot(client);
}

app.get('/', (req, res) => {
    res.send('The bot is running')
});

app.listen(port, () => {
    console.log(`Bot listening at http://localhost:${port}`)
});
let outputType = 'console';
//config = _.assignIn(config, overrides);
let tracker = new SaleTracker(config, outputType);
setInterval(async () => {
    await tracker.checkSales();
}, 30000);
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