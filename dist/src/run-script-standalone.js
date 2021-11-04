"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Use this to run your script directly without the cron.
 * node run-script-standalone.js --config='./config/sample.json' --outputType=console
 * Supported outputTypes are console/discord/twitter.
 */
const main_1 = __importDefault(require("./main"));
const sample_json_1 = __importDefault(require("../config/sample.json"));
// let configPath = async(yargs: Argv) => { return (await yargs(process.argv).argv).config};
// let overrides = async(yargs: Argv) => { return await yargs(process.argv).argv};
let outputType = 'console';
//config = _.assignIn(config, overrides);
let tracker = new main_1.default(sample_json_1.default, outputType);
setInterval(async () => {
    await tracker.checkSales();
}, 30000);
//tracker.checkSales();
//# sourceMappingURL=run-script-standalone.js.map