"use strict";
/**
 * Using yubico OTP test vectors from https://developers.yubico.com/OTP/Specifications/Test_vectors.html
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const main_1 = require("../src/main");
const assert_1 = __importDefault(require("assert"));
const testVectors = {
    clientId: '1',
    apiKey: 'mG5be6ZJU1qBGz24yPh/ESM3UdU=',
    nonce: 'jrFwbaYFhn0HoxZIsd9LQ6w2ceU',
    otp: 'vvungrrdhvtklknvrtvuvbbkeidikkvgglrvdgrfcdft',
    expected_h: decodeURIComponent('%2Bja8S3IjbX593/LAgTBixwPNGX4%3D')
};
async function generatedSignatureEqualsTestVectorSignature() {
    let paramsString = (0, main_1.buildParamsStringForSigning)({
        id: testVectors.clientId,
        nonce: testVectors.nonce,
        otp: testVectors.otp
    });
    const signature = (0, main_1.generateSignature)(paramsString, testVectors.apiKey);
    assert_1.default.equal(signature, testVectors.expected_h, `signature ${signature} does not match expected h ${testVectors.expected_h}`);
    console.log('Test passed: generated signature equals test vector signature');
    return true;
}
async function run() {
    await generatedSignatureEqualsTestVectorSignature();
}
run()
    .catch(console.error);
