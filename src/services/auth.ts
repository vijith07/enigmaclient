import {
  rsaGenerateKeyPair,
  exportPublicCryptoKey,
  wrapKey,
} from '../utils/crypto/rsaProvider'
import {
  ab2str,
  b642str,
  str2ab,
  str2b64,
  str2ua,
  ua2str,
} from '../utils/common'
import { generatePBKDF2Hash } from '../utils/crypto/pbkdf2HashGenerator'
import { exportAESKey, getAESKey } from '../utils/crypto/aesProvider'

const APIURL ='http://localhost:8000'

interface IUserData {
  public_key: string
  email: string
  wrapped_private_key: string
  iv: string
  salt: string
  name: string
  email_verified: boolean
  aes_key: string
}

export const createAccount = async (
  email: string,
  masterPassword: string,
  name: string,
  passwordHint?: string
) => {
  const keyPair = await rsaGenerateKeyPair()

  const salt = window.crypto.getRandomValues(new Uint8Array(16))

  // convert salt to base64
  const saltB64 = str2b64(ua2str(salt))

  const saltU8 = str2ua(b642str(saltB64))

  // compare the two salt and saltU8
  console.log('salt', salt)
  console.log('saltU8', saltU8)

  const passwordHash = await generatePBKDF2Hash(
    masterPassword,
    600000,
    'sha256'
  )

  const aesKey = await getAESKey(masterPassword, salt)

  const iv = window.crypto.getRandomValues(new Uint8Array(12))

  const wrappedKey = await wrapKey(keyPair.privateKey, aesKey, iv)

  const req = {
    public_key: str2b64(ab2str(await exportPublicCryptoKey(keyPair.publicKey))),
    email: email,
    password_hint: passwordHint,
    encrypted_private_key: str2b64(ab2str(wrappedKey)),
    iv: str2b64(ua2str(iv)),
    password: str2b64(ab2str(passwordHash)),
    name: name,
    salt: str2b64(ua2str(salt)),
    kdftype: 0,
    kdfiterations: 600000,
    email_verified: false,
  }
  // send the data to the server
  console.log('req', req)

  try {
    const res = await fetch(`${APIURL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req),
    })
    const data = await res.json()
    if (!res.ok) {
      return data
    }
    await saveUserData(data, masterPassword)
    return data
  } catch (error) {
    return error.message
  }
}

export const userSignin = async (email: string, password: string) => {
  const passwordHash = await generatePBKDF2Hash(password, 600000, 'sha256')
  const req = {
    email: email,
    password: str2b64(ab2str(passwordHash)),
  }
  try {
    const res = await fetch(`${APIURL}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req),
    })
    const data = await res.json()
    if (!res.ok) {
      return data
    }
    await saveUserData(data.user, password)
    return data
  } catch (error) {
    return error.message
  }
}

const saveUserData = async (data: any, password: string) => {
  const aesKey = await getAESKey(password, str2ua(b642str(data.salt)))
  const exportedAesKey = await exportAESKey(aesKey)
  const aesKeyB64 = str2b64(ab2str(exportedAesKey))

  const userData: IUserData = {
    public_key: data.public_key,
    email: data.email,
    wrapped_private_key: data.encrypted_private_key,
    iv: data.iv,
    salt: data.salt,
    name: data.name,
    email_verified: data.email_verified,
    aes_key: aesKeyB64,
  }
  sessionStorage.setItem('token', data.token)
  sessionStorage.setItem('user', JSON.stringify(userData))
}
