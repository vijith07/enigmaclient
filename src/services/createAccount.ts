import {
  rsaGenerateKeyPair,
  rsaEncrypt,
  rsaDecrypt,
  importPublicCryptoKey,
  exportPrivateCryptoKey,
  exportPublicCryptoKey,
  unwrapKey,
  wrapKey,
} from '../utils/crypto/rsaProvider'
import { ab2str, b642str, str2ab, str2b64 } from '../utils/common'
import { generatePBKDF2Hash } from '../utils/crypto/pbkdf2HashGenerator';
import { getAESKey, getKeyMaterial } from '../utils/crypto/aesProvider';


export const createAccount = async (
  email: string,
  masterPassword: string,
  passwordHint?: string,
  name?: string
) => {
  let salt = window.crypto.getRandomValues(new Uint8Array(16))

  const keyPair = await rsaGenerateKeyPair()

  const keyMaterial = await getKeyMaterial(masterPassword)

 const passwordHash = await generatePBKDF2Hash(masterPassword, salt, 600000, 'sha256')

  const aesKey = await getAESKey(keyMaterial, salt)

  const iv = window.crypto.getRandomValues(new Uint8Array(12))

  const pubKey = await importPublicCryptoKey(await exportPublicCryptoKey(keyPair.publicKey))

  const dbIV = window.btoa(ab2str(iv))

  console.log('privateKey', keyPair.privateKey)

  const wrappedKey = await wrapKey(keyPair.privateKey, masterPassword, salt, iv)

  console.log('wrappedKey', wrappedKey)

  const dbEncryptedPrivateKey = window.btoa(ab2str(wrappedKey))

  const pk = str2ab(b642str(dbEncryptedPrivateKey))

  console.log('pk', pk)
 

  console.log('dbEncryptedPrivateKey', dbEncryptedPrivateKey)

  const unwrappedKey = await unwrapKey(pk, masterPassword, salt, iv)

  console.log('unwrappedKey', unwrappedKey)

  // compare the unwrapped key with the original key

  // console.log('decryptedPrivateKey', decryptedPrivateKey)

  const data = str2ab(email)

  console.log('data', data)

  console.log('email', email)

  // // encrypt the data with the public key

  const encryptedData = await rsaEncrypt(data, pubKey)

  
  console.log('encryptedData', encryptedData)
  
  console.log('encryptedData',str2b64(ab2str(encryptedData)))
  
  // 

  // // decrypt the data with the private key
  const decryptedData = await rsaDecrypt(encryptedData, unwrappedKey)


  console.log('decryptedData', decryptedData)

  console.log('decryptedData', ab2str(decryptedData))

  // // compare the decrypted data with the original data

  // const decryptDataWithDecryptedPrivateKey = await rsaDecrypt(
  //   encryptedData,
  //   decryptedPrivateKey,
  //   'SHA-256'
  // )

  return {
    publicKey: str2b64(ab2str(await exportPublicCryptoKey(keyPair.publicKey))),
    email,
    passwordHint,
    privateKey: str2b64(ab2str(await exportPrivateCryptoKey(keyPair.privateKey))),
    encryptedPrivateKey: str2b64(ab2str(wrappedKey)),
    iv: str2b64(ab2str(iv)),
    passwordHash: str2b64(ab2str(passwordHash)),
    name,
    encryptedData: str2b64(ab2str(encryptedData)),
    decryptedData: ab2str(decryptedData),
  }
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
