async function rsaGenerateKeyPair(
  length: 1024 | 2048 | 4096
): Promise<[CryptoKey, CryptoKey]> {
  const rsaParams = {
    name: 'RSA-OAEP',
    modulusLength: length,
    publicExponent: new Uint8Array([0x01, 0x00, 0x01]), // 65537
    hash: { name: 'SHA-1' },
  } as RsaOaepParams
  const keyPair = (await window.crypto.subtle.generateKey(rsaParams, true, [
    'encrypt',
    'decrypt',
  ])) as CryptoKeyPair
  return [keyPair.publicKey, keyPair.privateKey]
}

async function rsaEncrypt(
  data: ArrayBuffer,
  publicKey: CryptoKey,
  algorithm: 'SHA-1' | 'SHA-256'
): Promise<ArrayBuffer> {
  // Note: Edge browser requires that we specify name and hash for both key import and decrypt.
  // We cannot use the proper types here.
  const rsaParams = {
    name: 'RSA-OAEP',
    hash: { name: algorithm },
  }
  return await window.crypto.subtle.encrypt(rsaParams, publicKey, data)
}

async function rsaDecrypt(
  data: ArrayBuffer,
  privateKey: CryptoKey,
  algorithm: 'SHA-1' | 'SHA-256'
): Promise<ArrayBuffer> {
  // Note: Edge browser requires that we specify name and hash for both key import and decrypt.
  // We cannot use the proper types here.
  const rsaParams = {
    name: 'RSA-OAEP',
    hash: { name: algorithm },
  }
  return await window.crypto.subtle.decrypt(rsaParams, privateKey, data)
}

export { rsaGenerateKeyPair, rsaEncrypt, rsaDecrypt }