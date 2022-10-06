"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runCmd = void 0;
const fs_1 = require("fs");
const process_1 = require("process");
const main_1 = require("./main");
async function runCmd(config) {
    const otp = await readOtp();
    const result = await (0, main_1.verifyOtp)(config, otp);
    console.log(result);
    process.exit();
}
exports.runCmd = runCmd;
async function readOtp() {
    console.log("Push (y) on yubico stick: ");
    return new Promise((resolve, reject) => {
        process.stdin.on('data', (data) => {
            const otp = data.toString().trim();
            return resolve(otp);
        });
    });
}
if (!process_1.argv[2]) {
    console.log('Please give path to JSON configuration file as argument!');
    process.exit();
}
var configPath = (0, fs_1.realpathSync)(process_1.argv[2]);
var config = require(configPath);
runCmd(config)
    .catch(console.error);
