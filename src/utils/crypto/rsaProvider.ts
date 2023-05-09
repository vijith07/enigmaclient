import { getAESKey, getKeyMaterial } from './aesProvider'

async function rsaGenerateKeyPair(): Promise<CryptoKeyPair> {
  return await window.crypto.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    true,
    ['encrypt', 'decrypt']
  )
}

async function rsaEncrypt(
  data: ArrayBuffer,
  publicKey: CryptoKey
): Promise<ArrayBuffer> {
  // Note: Edge browser requires that we specify name and hash for both key import and decrypt.
  // We cannot use the proper types here.
  const rsaParams: RsaOaepParams = {
    name: 'RSA-OAEP',
  }
  return await window.crypto.subtle.encrypt(rsaParams, publicKey, data)
}

async function rsaDecrypt(
  data: ArrayBuffer,
  privateKey: CryptoKey
): Promise<ArrayBuffer> {
  // Note: Edge browser requires that we specify name and hash for both key import and decrypt.
  // We cannot use the proper types here.

  console.log(privateKey.algorithm)

  const rsaParams: RsaOaepParams = {
    name: 'RSA-OAEP',
  }
  return await window.crypto.subtle.decrypt(rsaParams, privateKey, data)
}

const wrapKey = async (
  key: CryptoKey,
  wrappingKey: CryptoKey,
  iv: Uint8Array
) => {
  return await window.crypto.subtle.wrapKey('pkcs8', key, wrappingKey, {
    name: 'AES-GCM',
    iv: iv,
  })
}

/*
unwrap a key 
*/

const unwrapKey = async (
  wrappedKey: ArrayBuffer,
  unwrappingKey: CryptoKey,
  iv: Uint8Array
) => {
  return await window.crypto.subtle.unwrapKey(
    'pkcs8', // import format
    wrappedKey, // ArrayBuffer representing key to unwrap
    unwrappingKey, // CryptoKey representing key encryption key
    {
      // algorithm params for key encryption key
      name: 'AES-GCM',
      iv: iv,
    },
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256',
    } as RsaOaepParams,
    true, // extractability of key to unwrap
    ['decrypt'] // key usages for key to unwrap
  )
}

// export rsa public key
const exportPublicCryptoKey = async (key: CryptoKey) => {
  return await window.crypto.subtle.exportKey('spki', key)
}

// import rsa public key
const importPublicCryptoKey = async (key: ArrayBuffer) => {
  return await window.crypto.subtle.importKey(
    'spki',
    key,
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    true,
    ['encrypt']
  )
}

// export rsa private key
const exportPrivateCryptoKey = async (key: CryptoKey) => {
  return await window.crypto.subtle.exportKey('pkcs8', key)
}

export {
  rsaGenerateKeyPair,
  rsaEncrypt,
  rsaDecrypt,
  exportPrivateCryptoKey,
  exportPublicCryptoKey,
  wrapKey,
  unwrapKey,
  importPublicCryptoKey,
}
