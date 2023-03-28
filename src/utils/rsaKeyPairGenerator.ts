import crypto from "crypto";

export function generateRSAKeyPair(){
    // Generate an object where the keys are stored in properties 'privateKey' and 'publicKey'
    return crypto.generateKeyPairSync('rsa', {
        modulusLength: 4096,
        publicKeyEncoding: {
            type: 'pkcs1',
            format: 'pem'
        },
        privateKeyEncoding: {
            type: 'pkcs1',
            format: 'pem',
            cipher: 'aes-256-cbc',
        }
    });
}