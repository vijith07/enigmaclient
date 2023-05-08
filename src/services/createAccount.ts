import {
  rsaGenerateKeyPair,
  rsaEncrypt,
  rsaDecrypt,
} from '../utils/rsaProvider'
import { aesEncrypt, aesDecrypt } from '../utils/aesProvider'
import { ab2str, fromUtf8ToArray, str2ab, toByteString } from '../utils/common'
import { toBuf } from '../utils/common'

/*
Get some key material to use as input to the deriveKey method.
The key material is a password supplied by the user.
*/
function getKeyMaterial(password:string) {
  const enc = new TextEncoder();
  return window.crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );
}


/*
Given some key material and some random salt
derive an AES-GCM key using PBKDF2.
*/

const getAESKey = async (keyMaterial: CryptoKey, salt: Uint8Array) => {
  return await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 600000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['wrapKey', 'unwrapKey']
  )
}

/*
wrap a key 
*/

const wrapKey = async (
  key: CryptoKey,
  password: string,
  salt: Uint8Array,
  iv: Uint8Array
) => {
  const keyMaterial = await getKeyMaterial(password)
  const wrappingKey = await getAESKey(keyMaterial, salt)

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
  password: string,
  salt: Uint8Array,
  iv: Uint8Array
) => {
  const keyMaterial = await getKeyMaterial(password)
  const unwrappingKey = await getAESKey(keyMaterial, salt)


  return await window.crypto.subtle.unwrapKey(
    "pkcs8", // import format
    wrappedKey, // ArrayBuffer representing key to unwrap
    unwrappingKey, // CryptoKey representing key encryption key
    {
      // algorithm params for key encryption key
      name: "AES-GCM",
      iv: iv,
    },
    {
      // algorithm params for key to unwrap
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    true, // extractability of key to unwrap
    ["decrypt"] // key usages for key to unwrap
  );
}

// convert CryptoKey to ArrayBuffer
export async function exportCryptoKey(key: CryptoKey) {
  const exported = await window.crypto.subtle.exportKey('pkcs8', key)
  return exported
}

export const createAccount = async (
  email: string,
  masterPassword: string,
  passwordHint?: string,
  name?: string
) => {
  let salt = window.crypto.getRandomValues(new Uint8Array(16))

  const [publicKey,privateKey] = await rsaGenerateKeyPair(1024)

  const keyMaterial = await getKeyMaterial(masterPassword)

  const aesKey = await getAESKey(keyMaterial, salt)

  const iv = window.crypto.getRandomValues(new Uint8Array(12))


  const dbIV = window.btoa(ab2str(iv))

  console.log('privateKey', privateKey)

  const wrappedKey = await wrapKey(privateKey, masterPassword, salt, iv)

  console.log('wrappedKey', wrappedKey)

  const dbEncryptedPrivateKey = window.btoa(ab2str(wrappedKey))

  console.log('dbEncryptedPrivateKey', dbEncryptedPrivateKey)

  const unwrappedKey = await unwrapKey(wrappedKey, masterPassword, salt, iv)

  console.log('unwrappedKey', unwrappedKey)

  // compare the unwrapped key with the original key

  // console.log('decryptedPrivateKey', decryptedPrivateKey)

  const data = email

  // // encrypt the data with the public key

  const encryptedData = await rsaEncrypt(str2ab(data), publicKey, 'SHA-256')

  const decryptedData = await rsaDecrypt(encryptedData, unwrappedKey, 'SHA-256')
  
  console.log('encryptedData', encryptedData)

  console.log('encryptedData', window.btoa(ab2str(encryptedData)))

  // // decrypt the data with the private key


  console.log('decryptedData', decryptedData)

  console.log('decryptedData', ab2str(decryptedData))

  // // compare the decrypted data with the original data

  // const decryptDataWithDecryptedPrivateKey = await rsaDecrypt(
  //   encryptedData,
  //   decryptedPrivateKey,
  //   'SHA-256'
  // )

  // return {
  //   publicKey: window.btoa(ab2str(publicKey)),
  //   email,
  //   passwordHint,
  //   privateKey: window.btoa(ab2str(privateKey)),
  //   encryptedPrivateKey: window.btoa(ab2str(encryptedPrivateKey)),
  //   iv: window.btoa(ab2str(iv)),
  //   passwordHash: window.btoa(ab2str(passwordHash)),
  //   name,
  //   encryptedData: window.btoa(ab2str(encryptedData)),
  //   decryptedData: ab2str(decryptedData),
  //   decryptDataWithDecryptedPrivateKey: toByteString(
  //     decryptDataWithDecryptedPrivateKey
  //   ),
  // }
}

// // convert ArrayBuffer to string
// export function toByteString(hash: ArrayBuffer) {
//   const hashArray = Array.from(new Uint8Array(hash))
//   return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
// }

// // convert string to ArrayBuffer
// export function toBuf(value: string | ArrayBuffer) {
//     return typeof value === 'string' ? fromUtf8ToArray(value) : value
// }

// compare two array buffers
export function compareArrayBuffers(buf1: ArrayBuffer, buf2: ArrayBuffer) {
  if (buf1.byteLength !== buf2.byteLength) {
    return false
  }
  const dv1 = new Int8Array(buf1)
  const dv2 = new Int8Array(buf2)
  for (let i = 0; i !== buf1.byteLength; i++) {
    if (dv1[i] !== dv2[i]) {
      return false
    }
  }
  return true
}
