"use strict";
/**
 * Validates yubico OTP as described in https://developers.yubico.com/OTP/Specifications/OTP_validation_protocol.html
 *
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyOtp = exports.buildParamsStringForSigning = exports.generateSignature = void 0;
const https = __importStar(require("https"));
const crypto = __importStar(require("crypto"));
function generateSignature(message, apiKey) {
    const decodedApiKey = Buffer.from(apiKey, 'base64');
    const octet = toOctet(message);
    const digester = crypto.createHmac('sha1', decodedApiKey);
    const signature = digester.update(octet).digest('base64');
    return signature;
}
exports.generateSignature = generateSignature;
/**
 * Builds params string from an params Object without h key/value
 * @param {Object} params
 * @returns
 */
function buildParamsStringForSigning(params) {
    return Object.keys(params).filter(k => k != 'h').sort().map(k => (`${k}=${params[k]}`)).join('&');
}
exports.buildParamsStringForSigning = buildParamsStringForSigning;
async function verifyOtp(config, otp) {
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
        deviceId: otp.substring(0, 12),
        signatureValid: checkSignature == validationResult.h
    });
}
exports.verifyOtp = verifyOtp;
async function requestValidation(url) {
    return new Promise((resolve, reject) => {
        https.request(url, async function (res) {
            const str = await streamToString(res);
            const parsed = str.split('\r\n')
                .filter(d => d)
                .map(d => {
                const assignCharIndex = d.indexOf('='); // split only at first =
                const key = d.substring(0, assignCharIndex);
                const value = d.substring(assignCharIndex + 1);
                let result = {};
                result[key] = value;
                return result;
            }).reduce((prev, cur) => Object.assign(prev, cur), {});
            return resolve(parsed);
        }).end();
    });
}
async function streamToString(readable) {
    var str = '';
    return new Promise((resolve, reject) => {
        readable.on('data', function (chunk) {
            str += chunk.toString();
        });
        readable.on('end', function () {
            return resolve(str);
        });
    });
}
function generateUniqueAscii() {
    const chars = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ123456789';
    let result = '';
    const len = 20;
    for (let i = 1; i <= len; i++) {
        let c = Math.floor(Math.random() * chars.length + 1);
        result += chars.charAt(c);
    }
    return result;
}
function toOctet(str) {
    let result = new Int8Array(str.length);
    for (let index = 0; index < str.length; index++) {
        const code = str.charCodeAt(index);
        result[index] = code;
    }
    return result;
}
