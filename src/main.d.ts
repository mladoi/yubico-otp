import {VerificationResult, Config}  from './types'

export declare function verifyOtp(config: Config, otp: string): Promise<VerificationResult>;