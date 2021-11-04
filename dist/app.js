"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const getenv_1 = __importDefault(require("getenv"));
const sample_json_1 = __importDefault(require("./config/sample.json"));
const app = (0, express_1.default)();
const port = getenv_1.default.int('PORT', 5000);
const main_1 = __importDefault(require("./src/main"));
const discord_js_1 = require("discord.js");
if ((0, getenv_1.default)('DISCORD_BOT_TOKEN', 'null') !== 'null') {
    const client = new discord_js_1.Client();
    initBot(client);
}
app.get('/', (req, res) => {
    res.send('The bot is running');
});
app.listen(port, () => {
    console.log(`Bot listening at http://localhost:${port}`);
});
let outputType = 'console';
//config = _.assignIn(config, overrides);
let tracker = new main_1.default(sample_json_1.default, outputType);
setInterval(async () => {
    await tracker.checkSales();
}, 30000);
async function initBot(client) {
    return new Promise((resolve, reject) => {
        ['DISCORD_BOT_TOKEN', 'DISCORD_CHANNEL_ID'].forEach((envVar) => {
            if (!(0, getenv_1.default)(envVar))
                reject(`${envVar} not set`);
        });
        client.login((0, getenv_1.default)("DISCORD_BOT_TOKEN"));
        client.on('ready', async () => {
            console.log(`Logged in as ${client?.user?.tag}!`);
            console.log(`Listening to new events for collection ${(0, getenv_1.default)('COLLECTION_NAME')}`);
            const channel = await client.channels.fetch((0, getenv_1.default)("DISCORD_CHANNEL_ID"));
            resolve(channel);
        });
    });
}
//# sourceMappingURL=app.js.map