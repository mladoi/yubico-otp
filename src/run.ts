import { realpathSync } from "fs";
import { argv } from "process";
import { verifyOtp } from "./main";
import { Config } from "./types";

export async function runCmd(config: Config) {
    const otp = await readOtp();
    const result = await verifyOtp(config, otp);
    console.log(result);
    process.exit();
}

async function readOtp(): Promise<string> {
    console.log("Push (y) on yubico stick: ")
    return new Promise((resolve, reject) => {
        process.stdin.on('data', (data) => {
            const otp = data.toString().trim()
            return resolve(otp);
        })
    });
}

if (!argv[2]) {
    console.log('Please give path to JSON configuration file as argument!')
    process.exit();
}

var configPath = realpathSync(argv[2])
var config: Config = require(configPath);

runCmd(config)
    .catch(console.error)
