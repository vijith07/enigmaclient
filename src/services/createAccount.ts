import {
  rsaGenerateKeyPair,
  rsaEncrypt,
  rsaDecrypt,
} from '../utils/rsaProvider'
import { generatePBKDF2Hash } from '../utils/pbkdf2HashGenerator'
import { aesEncrypt, aesDecrypt } from '../utils/aesProvider'
import { fromUtf8ToArray, toByteString } from '../utils/common'
import { toBuf } from '../utils/common'

export const createAccount = async (
  email: string,
  masterPassword: string,
  passwordHint?: string,
  name?: string
) => {
  const [publicKey, privateKey] = await rsaGenerateKeyPair(1024)

  // create a password hash
  const passwordHash = await generatePBKDF2Hash(
    masterPassword,
    'salt',
    600000,
    'sha256'
  )

  const iv = window.crypto.getRandomValues(new Uint8Array(16))

  const encryptedPrivateKey = await aesEncrypt(privateKey, iv, passwordHash)

  // store the encrypted private key, iv, password hash, email, password hint, name, public key

  // return the object containing the public key , email, password hint, encrypted private key, iv, password hash, name

  // decrypt the private key with the password hash

  const decryptedPrivateKey = await aesDecrypt(
    encryptedPrivateKey,
    iv,
    passwordHash
  )

  const data = email

  // encrypt the data with the public key

  const encryptedData = await rsaEncrypt(toBuf(data), publicKey, 'SHA-256')

  // decrypt the data with the private key

  const decryptedData = await rsaDecrypt(encryptedData, privateKey, 'SHA-256')

  // compare the decrypted data with the original data

  const decryptDataWithDecryptedPrivateKey = await rsaDecrypt(
    encryptedData,
    decryptedPrivateKey,
    'SHA-256'
  )

  return {
    publicKey: toByteString(publicKey),
    email,
    passwordHint,
    privateKey: toByteString(privateKey),
    encryptedPrivateKey: toByteString(encryptedPrivateKey),
    iv: toByteString(iv),
    passwordHash: passwordHash,
    name,
    encryptedData: toByteString(encryptedData),
    decryptedData: toByteString(decryptedData),
    decryptDataWithDecryptedPrivateKey: toByteString(decryptDataWithDecryptedPrivateKey),
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
