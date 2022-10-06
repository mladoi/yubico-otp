/**
 * Validates yubico OTP as described in https://developers.yubico.com/OTP/Specifications/OTP_validation_protocol.html
 * 
 */

import * as https from 'https'
import * as crypto from 'crypto';

// apiKey (secret key): what we get from key registration at upgrade.yubico.com/getapikey.
// apiKey is base64 encoded

import { Config, VerificationResult } from './types';

export function generateSignature(message, apiKey) {
    const decodedApiKey = Buffer.from(apiKey, 'base64')
    const octet = toOctet(message);
    const digester = crypto.createHmac('sha1', decodedApiKey);
    const signature = digester.update(octet).digest('base64');
    return signature;
}

/**
 * Builds params string from an params Object without h key/value
 * @param {Object} params 
 * @returns 
 */
export function buildParamsStringForSigning(params: Record<string,string>) {
    return Object.keys(params).filter(k => k != 'h').sort().map(k => 
        (`${k}=${params[k]}`)
    ).join('&')
}

export async function verifyOtp(config: Config, otp: string): Promise<VerificationResult> {        
    const nonce = generateUniqueAscii();    
    const paramsString = buildParamsStringForSigning({
        id: config.clientId, 
        nonce: nonce, 
        otp: otp
    });        
    const signature = generateSignature(paramsString, config.apiKey);
    const url = config.serviceUrl + "?" + paramsString + "&h=" + signature;    
    const validationResult = await requestValidation(url);
    // console.log('Validation result:', validationResult);    
    const checkSignature = generateSignature(buildParamsStringForSigning(validationResult), config.apiKey);
    return Object.assign(validationResult, {
        deviceId: otp.substring(0,12), 
        signatureValid: checkSignature == validationResult.h
    });
}

async function requestValidation(url): Promise<Record<string, string>> {
    return new Promise((resolve, reject) => {
        https.request(url, async function (res) {
            const str = await streamToString(res)
            const parsed = str.split('\r\n')
                .filter(d => d)
                .map(d => {
                    const assignCharIndex = d.indexOf('='); // split only at first =
                    const key = d.substring(0, assignCharIndex);
                    const value = d.substring(assignCharIndex+1)
                    let result = {};
                    result[key] = value;
                    return result
                }).reduce((prev,cur) => Object.assign(prev, cur), {});
            return resolve(parsed);
        }).end();
    });
}

async function streamToString(readable): Promise<string> {
    var str = ''
    return new Promise((resolve, reject) => {
        readable.on('data', function (chunk) {
            str += chunk.toString()
        })
        readable.on('end', function () {
            return resolve(str);
        })
    });
}

function generateUniqueAscii() {
    const chars = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ123456789';
    let result = '';
    const len = 20;
    for (let i=1;i<=len;i++) {
      let c = Math.floor(Math.random()*chars.length + 1)
      result += chars.charAt(c)
    }
    return result
}

function toOctet(str) {    
    let result = new Int8Array(str.length);
    for (let index = 0; index < str.length; index++) {
        const code = str.charCodeAt(index);
        result[index] = code;
    }    
    return result;
}