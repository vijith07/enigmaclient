import {
  str2ab,
  b642str,
  str2b64,
  ua2str,
  str2ua,
  ab2str,
} from '../utils/common'
import {
  aesDecrypt,
  aesEncrypt,
  exportAESKey,
  generateAESKey,
  importAESKey,
} from '../utils/crypto/aesProvider'
import {
  importPublicCryptoKey,
  rsaDecrypt,
  rsaEncrypt,
  unwrapKey,
} from '../utils/crypto/rsaProvider'

const APIURL = 'http://localhost:8000'

export interface ISend {
  name: string
  type: number
  text: string
  hideText: boolean
  expiryDate: string
  deleteDate: string
  notes: string
  password: string
  shareOnSave: boolean
  hideEmail: boolean
  disableAfterAccess: boolean
  accessLimit: number
}
export interface ISendResponse {
  access_count: number
  creation_time: string
  data: string
  deletion_time: string
  disabled: boolean
  encrypted_key: string
  expiration_time: string
  hide_data: boolean
  hide_email: boolean
  id: string
  iv: string
  max_access_count: number
  name: string
  notes: string
  password: string
  revision_time: string
  type_: number
  user_id: number
}

export interface IAccessSend {
  type_: number
  data: string
  encrypted_key: string
  password?: string
  hide_data: boolean
  email?: string
  name: string
  iv: string
}

export const createSend = async (send: ISend) => {
  // get the aes key from session storage
  const user = sessionStorage.getItem('user')
  if (!user) {
    return 'User not found'
  }
  const userData = JSON.parse(user)
  // const aesKey = await importAESKey(str2ab(b642str(userData.aes_key)), ['wrapKey', 'unwrapKey'])
  // const aesIV = str2ua(b642str(userData.iv))
  const public_key = await importPublicCryptoKey(
    str2ab(b642str(userData.public_key))
  )
  // const wrapped_private_key = str2ab(b642str(userData.wrapped_private_key))
  // const privateKey = await unwrapKey(wrapped_private_key, aesKey, aesIV)

  // denerate new aes key and iv
  // const aesKey = await importAESKey()
  const iv = window.crypto.getRandomValues(new Uint8Array(12))

  // generate new aes key
  const aesKey = await generateAESKey()

  // encrypt each field
  const encryptedName = str2b64(
    ab2str(await aesEncrypt(str2ab(send.name), aesKey, iv))
  )
  // const encryptedType = await aesEncrypt(send.type.toString(), aesKey, iv
  const encryptedText = str2b64(
    ab2str(await aesEncrypt(str2ab(send.text), aesKey, iv))
  )
  const encryptedNotes = str2b64(
    ab2str(await aesEncrypt(str2ab(send.notes), aesKey, iv))
  )
  const encryptedPassword = str2b64(
    ab2str(await aesEncrypt(str2ab(send.password), aesKey, iv))
  )

  // convert iv to base64
  const ivB64 = str2b64(ua2str(iv))
  // export aes key
  const encryptedAesKeyB64 = str2b64(
    ab2str(await rsaEncrypt(await exportAESKey(aesKey), public_key))
  )
  const req = {
    name: encryptedName,
    type_: send.type,
    data: encryptedText,
    hide_data: send.hideText,
    expiration_time: send.expiryDate.replace(' ', ''),
    deletion_time: send.deleteDate.replace(' ', ''),
    notes: encryptedNotes,
    password: encryptedPassword,
    hide_email: send.hideEmail,
    disabled: send.disableAfterAccess,
    max_access_count: send.accessLimit,
    iv: ivB64,
    encrypted_key: encryptedAesKeyB64,
  }

  console.log(JSON.stringify(req))

  try {
    const res = await fetch(`${APIURL}/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionStorage.getItem('token')}`,
      },
      body: JSON.stringify(req),
    })
    const data = await res.json()
    if (!res.ok) {
      return data
    }
    return data
  } catch (error) {
    return error.message
  }
}

export const getSends = async () => {
  // check if user is logged in
  const user = sessionStorage.getItem('user')
  if (!user) {
    return 'User not d'
  }
  try {
    const res = await fetch(`${APIURL}/send`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionStorage.getItem('token')}`,
      },
    })
    if (!res.ok) {
      return await res.json()
    }
    const data: ISendResponse[] = await res.json()

    // get wrapped private key from session storage
    const user = sessionStorage.getItem('user')
    if (!user) {
      return 'User not found'
    }
    const userData = JSON.parse(user)
    const aesKey = await importAESKey(str2ab(b642str(userData.aes_key)), [
      'wrapKey',
      'unwrapKey',
    ])
    const aesIV = str2ua(b642str(userData.iv))
    const wrapped_private_key = str2ab(b642str(userData.wrapped_private_key))
    const privateKey = await unwrapKey(wrapped_private_key, aesKey, aesIV)

    // decrypt each send
    const decryptedSends = await Promise.all(
      data.map(async (send) => {
        return await decryptSend(send, privateKey)
      })
    )
    return decryptedSends
  } catch (error) {
    return error.message
  }
}

// decrypt the send response and return the decrypted send
export const decryptSend = async (
  send: ISendResponse,
  privateKey: CryptoKey
): Promise<ISendResponse> => {
  // using crypto key decrypt the aes key
  const aesKey = await importAESKey(
    await rsaDecrypt(str2ab(b642str(send.encrypted_key)), privateKey),
    ['encrypt', 'decrypt']
  )
  // convert iv to Uint8Array
  const iv = str2ua(b642str(send.iv))
  // decrypt the name
  const name = ab2str(await aesDecrypt(str2ab(b642str(send.name)), aesKey, iv))
  // decrypt the text
  const data = ab2str(await aesDecrypt(str2ab(b642str(send.data)), aesKey, iv))
  // decrypt the notes
  const notes = ab2str(
    await aesDecrypt(str2ab(b642str(send.notes)), aesKey, iv)
  )
  const password = ab2str(
    await aesDecrypt(str2ab(b642str(send.password)), aesKey, iv)
  )

  const exportedAesKey = str2b64(ab2str(await exportAESKey(aesKey)))

  return {
    name,
    type_: send.type_,
    expiration_time: send.expiration_time,
    notes,
    password: password,
    hide_email: send.hide_email,
    disabled: send.disabled,
    max_access_count: send.max_access_count,
    access_count: send.access_count,
    creation_time: send.creation_time,
    id: send.id,
    data,
    encrypted_key: exportedAesKey,
    iv: send.iv,
    deletion_time: send.deletion_time,
    hide_data: send.hide_data,
    user_id: send.user_id,
    revision_time: send.revision_time,
  }
}

// getSend for access
export const getSendforAccess = async (id: string, key: string) => {
  try {
    const res = await fetch(`${APIURL}/receive/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    if (!res.ok) {
      return await res.json()
    }
    const data = await res.json()
    return data
  } catch (error) {
    return error.message
  }
}

// verify send password
export const verifySendPassword = async (
  key: string,
  iv: string,
  send_password: string,
  user_password: string
) => {
  const ivUint8 = str2ua(b642str(iv))
  const aesKey = await importAESKey(str2ab(b642str(key)), [
    'encrypt',
    'decrypt',
  ])
  const decryptedPassword = ab2str(
    await aesDecrypt(str2ab(b642str(send_password)), aesKey, ivUint8)
  )
  if (decryptedPassword === user_password) {
    return true
  }
  return false
}

// decrypt send data
export const decryptAccessSend = async (
  key: string,
  accessSend: IAccessSend
) => {
  const ivUint8 = str2ua(b642str(accessSend.iv))
  const aesKey = await importAESKey(str2ab(b642str(key)), [
    'encrypt',
    'decrypt',
  ])
  const decryptedData = ab2str(
    await aesDecrypt(str2ab(b642str(accessSend.data)), aesKey, ivUint8)
  )
  const decryptedName = ab2str(
    await aesDecrypt(str2ab(b642str(accessSend.name)), aesKey, ivUint8)
  )
  let decryptedEmail = ''
  if (accessSend.email.length > 0) {
    decryptedEmail = b642str(accessSend.email)
  }
  return {
    data: decryptedData,
    email: decryptedEmail,
    name: decryptedName,
  }
}
