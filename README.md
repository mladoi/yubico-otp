# yubico-otp
Client for Yubico OTP verification service as described in [Validation_Protocol_V2](https://developers.yubico.com/yubikey-val/Validation_Protocol_V2.0.html)

## Usage
```js
import {verifyOtp} from 'yubico-otp-client'

const otp = "OTP string from yubikey"

var result = await verifyOtp({
    apiKey: '<secret key>', 
    clientId: '<client id>', 
    serviceurl: 'https://api.yubico.com/wsapi/2.0/verify'}, otp);
```

A successful verification `result` will have this form: 

```js
{
  h: 'pGPA07mlKf6XXeZ/0TrIgy5cZCQ=',
  t: '2022-10-06T14:28:05Z0414',
  otp: 'cccfgnhcfbccckvntjgitbjfcleteuvkfrkrjevrrjet',
  nonce: 'd9inSRVLkK1vm9nyNpfj',
  sl: '100',
  status: 'OK',
  deviceId: 'cccfgnhcfbcc',
  signatureValid: true,
  isOk: true
}
```
Beside the key/values provided by the yubico verification service [(Validation_Protocol_V2#Response)](https://developers.yubico.com/yubikey-val/Validation_Protocol_V2.0.html#_response), the fields `deviceId` and `signatureValid` are added to the result.

The field `signatureValid` will indicate that the returned `h` value did pass the signature check, while `deviceId` represents the public key of the yubikey (first 12 chars of OTP). The field `isOk` will have the boolean value `true`, only if the response `status` field equals `"OK"`.





