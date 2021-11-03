/**
 * Use this to run your script directly without the cron.
 * node run-script-standalone.js --config='./config/sample.json' --outputType=console
 * Supported outputTypes are console/discord/twitter.
 */
import SalesTracker from './main';
import config from '../config/sample.json';
import _ from 'lodash';

// let configPath = async(yargs: Argv) => { return (await yargs(process.argv).argv).config};
// let overrides = async(yargs: Argv) => { return await yargs(process.argv).argv};
let outputType = 'console';
//config = _.assignIn(config, overrides);
let tracker = new SalesTracker(config, outputType);
setInterval(async () => {
    await tracker.checkSales();
}, 30000);
//tracker.checkSales();