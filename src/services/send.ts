import {
  str2ab,
  b642str,
  str2b64,
  ua2str,
  str2ua,
  ab2str,
} from '../utils/common'
import {
  aesEncrypt,
  exportAESKey,
  generateAESKey,
  importAESKey,
} from '../utils/crypto/aesProvider'
import {
  importPublicCryptoKey,
  rsaEncrypt,
  unwrapKey,
} from '../utils/crypto/rsaProvider'
import { convertToNaiveDateTime } from '../utils/dateTime'

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
    expiration_time: send.expiryDate.replace(' ',''),
    deletion_time: send.deleteDate.replace(' ',''),
    notes: encryptedNotes,
    password: send.password,
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
        Authorization: `Bearer ${localStorage.getItem('token')}`,
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
