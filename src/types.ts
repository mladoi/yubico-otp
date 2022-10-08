export interface VerificationResult extends Record<string, string|boolean> {    
    /** status equals "OK" */
    isOk: boolean,
    /** first 12 chars of OTP represent public key of usb device */
    deviceId: string,
    /** does the returned h match the signature generated from the response */
    signatureValid: boolean
}

export interface Config {    
    clientId: string,
    /** secret key */
    apiKey: string,
    /** yubico verification service url */
    serviceUrl: string,
}

/** params used for signing */
export interface SigningParams {
    id: string,
    nonce: string,
    otp: string
}
