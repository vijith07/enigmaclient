import crypto from 'crypto'

async function rsaGenerateKeyPair(
  length: 1024 | 2048 | 4096
): Promise<[ArrayBuffer, ArrayBuffer]> {
  const rsaParams = {
    name: 'RSA-OAEP',
    modulusLength: length,
    publicExponent: new Uint8Array([0x01, 0x00, 0x01]), // 65537
    hash: { name: 'SHA-1' },
  } as RsaHashedKeyGenParams
  const keyPair = (await window.crypto.subtle.generateKey(rsaParams, true, [
    'encrypt',
    'decrypt',
  ])) as CryptoKeyPair
  const publicKey = await window.crypto.subtle.exportKey(
    'spki',
    keyPair.publicKey
  )
  const privateKey = await window.crypto.subtle.exportKey(
    'pkcs8',
    keyPair.privateKey
  )
  return [publicKey, privateKey]
}

async function rsaEncrypt(
  data: ArrayBuffer,
  publicKey: ArrayBuffer,
  algorithm: 'SHA-1' | 'SHA-256'
): Promise<ArrayBuffer> {
  // Note: Edge browser requires that we specify name and hash for both key import and decrypt.
  // We cannot use the proper types here.
  const rsaParams = {
    name: 'RSA-OAEP',
    hash: { name: algorithm },
  }
  const impKey = await window.crypto.subtle.importKey(
    'spki',
    publicKey,
    rsaParams,
    true,
    ['encrypt']
  )
  return await window.crypto.subtle.encrypt(rsaParams, impKey, data)
}

async function rsaDecrypt(
  data: ArrayBuffer,
  privateKey: ArrayBuffer,
  algorithm: 'SHA-1' | 'SHA-256'
): Promise<ArrayBuffer> {
  // Note: Edge browser requires that we specify name and hash for both key import and decrypt.
  // We cannot use the proper types here.
  const rsaParams = {
    name: 'RSA-OAEP',
    hash: { name: algorithm },
  }
  const impKey = await window.crypto.subtle.importKey(
    'pkcs8',
    privateKey,
    rsaParams,
    true,
    ['decrypt']
  )
  return await window.crypto.subtle.decrypt(rsaParams, impKey, data)
}

async function rsaExtractPublicKey(privateKey : ArrayBuffer){
    const rsaParams = {
        name: "RSA-OAEP",
        // Have to specify some algorithm
        hash: { name: "SHA-1" },
      };
      const impPrivateKey = await window.crypto.subtle.importKey("pkcs8", privateKey, rsaParams, true, [
        "decrypt",
      ]);
      const jwkPrivateKey = await window.crypto.subtle.exportKey("jwk", impPrivateKey);
      const jwkPublicKeyParams = {
        kty: "RSA",
        e: jwkPrivateKey.e,
        n: jwkPrivateKey.n,
        alg: "RSA-OAEP",
        ext: true,
      };
      const impPublicKey = await window.crypto.subtle.importKey("jwk", jwkPublicKeyParams, rsaParams, true, [
        "encrypt",
      ]);
      return await window.crypto.subtle.exportKey("spki", impPublicKey);
}

export { rsaGenerateKeyPair, rsaEncrypt, rsaDecrypt, rsaExtractPublicKey }