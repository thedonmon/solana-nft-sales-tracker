/**
 * Use this to run your script directly without the cron.
 * node run-script-standalone.js --config='./config/sample.json' --outputType=console
 * Supported outputTypes are console/discord/twitter.
 */
import SalesTracker from './src/main';
import yargs from 'yargs'
import fs from 'fs';
import _ from 'lodash';

let configPath = yargs(process.argv).argv.config;
let overrides = yargs(process.argv).argv;
let outputType = overrides.outputType || 'console';;

let config = JSON.parse(fs.readFileSync(configPath).toString());
config = _.assignIn(config, overrides);
let tracker = new SalesTracker(config, outputType);
setInterval(() => {
    tracker.checkSales();
}, 30000);
//tracker.checkSales();