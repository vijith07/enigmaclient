import {
  APIURL,
  type ISend,
  type IAccessSend,
  type IFileData,
  type IFileDataResponse,
} from './types'
import { str2ab, b642str, str2ua, ab2str, str2b64 } from '../../utils/common'
import {
  importAESKey,
  aesDecrypt,
  exportAESKey,
} from '../../utils/crypto/aesProvider'
import { unwrapKey, rsaDecrypt } from '../../utils/crypto/rsaProvider'
import { downloadFile } from '../../utils/file'

export const getSends = async () => {
  // check if user is logged in
  const user = sessionStorage.getItem('user')
  if (!user) {
    throw new Error('User not found')
  }
  try {
    const res = await requestSends()
    const data: ISend[] = await res.json()
    const user = sessionStorage.getItem('user')
    if (!user) {
      throw new Error('User not found')
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
    throw new Error(error)
  }
}

// decrypt the send response and return the decrypted send
export const decryptSend = async (
  send: ISend,
  privateKey: CryptoKey
): Promise<ISend> => {
  // using crypto key decrypt the aes key

  const aesKey = await importAESKey(
    await rsaDecrypt(str2ab(b642str(send.encrypted_key)), privateKey),
    ['encrypt', 'decrypt']
  )


  // convert iv to Uint8Array
  const iv = str2ua(b642str(send.iv))
  let text_data = null
  if (send.send_type === 0) {
    text_data = await decryptData(send.data, aesKey, iv)
  }
  const name = await decryptData(send.name, aesKey, iv)

  let file_data: IFileData = {
    file_name: '',
    file_type: '',
    id: '',
    file_size: 0,
  }
  if (send.send_type === 1) {
    const send_file_data: IFileData = JSON.parse(send.data)
    file_data.file_name = await decryptData(
      send_file_data.file_name,
      aesKey,
      iv
    )
    file_data.file_type = send_file_data.file_type
    file_data.id = send_file_data.id
    file_data.file_size = send_file_data.file_size
  }

  const notes = await decryptData(send.notes, aesKey, iv)
  const password = await decryptData(send.password, aesKey, iv)
  const exportedAesKey = str2b64(ab2str(await exportAESKey(aesKey)))


  return {
    name,
    send_type: send.send_type,
    expiration_time: send.expiration_time,
    notes,
    password: password,
    hide_email: send.hide_email,
    max_access_count: send.max_access_count,
    access_count: send.access_count,
    created_at: send.created_at,
    id: send.id,
    text_data,
    file_data,
    encrypted_key: exportedAesKey,
    iv: send.iv,
    deletion_time: send.deletion_time,
    hide_data: send.hide_data,
    user_id: send.user_id,
    revised_at: send.revised_at,
    data: send.data,
  }
}

// getSend for access
export const getSendforAccess = async (id: string): Promise<IAccessSend> => {
  try {
    const res = await fetch(`${APIURL}/receive/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    if (!res.ok) {
      throw new Error(await res.json().then((data) => data.message))
    }
    const data: IAccessSend = await res.json().then((data) => data.send)
    return data
  } catch (error) {
    throw new Error(error)
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

// create a common decrypt function for text and file AccessSend
export const decryptAccessSend = async (
  key: string,
  accessSend: IAccessSend
): Promise<IAccessSend> => {
  const ivUint8 = str2ua(b642str(accessSend.iv))
  const aesKey = await importAESKey(str2ab(b642str(key)), [
    'encrypt',
    'decrypt',
  ])
  let decryptedTextData = await decryptData(
    accessSend.text_data,
    aesKey,
    ivUint8
  )
  let decryptedFileData: IFileDataResponse = {
    file_name: '',
    file_type: '',
    id: '',
    file_size: 0,
    url: '',
  }
  if (accessSend.send_type === 1) {
    decryptedFileData.file_name = await decryptData(
      accessSend.file_data.file_name,
      aesKey,
      ivUint8
    )
    decryptedFileData.file_type = accessSend.file_data.file_type
    decryptedFileData.id = accessSend.file_data.id
    decryptedFileData.file_size = accessSend.file_data.file_size
    decryptedFileData.url = accessSend.file_data.url
  }

  const decryptedName = await decryptData(accessSend.name, aesKey, ivUint8)

  let decryptedAccessSend: IAccessSend = {
    name: decryptedName,
    send_type: accessSend.send_type,
    encrypted_key: accessSend.encrypted_key,
    iv: accessSend.iv,
    file_data: decryptedFileData,
    text_data: decryptedTextData,
    hide_data: accessSend.hide_data,
    email: accessSend.email,
    password: accessSend.password,
  }
  return decryptedAccessSend
}

//  send get request to s3 presigned url to get file data
export const getFileData = async (file_data: IFileDataResponse) => {
  try {
    const res = await fetch(file_data.url, {
      method: 'GET',
      headers: {
        'Content-Type': file_data.file_type,
      },
    })
    if (!res.ok) {
      throw new Error(await res.json().then((data) => data.message))
    }
    const data = await res.blob()
    const encryptedFile = await data.arrayBuffer()
    // create file
    const file = new File([encryptedFile], file_data.file_name, {
      type: file_data.file_type,
    })
    return file
  } catch (error) {
    throw new Error(error)
  }
}

// decrypt file
export const decryptFile = async (
  file: File,
  key: CryptoKey,
  iv: Uint8Array
) => {
  const encryptedFileData = await file.arrayBuffer()
  const decryptedFileData = await aesDecrypt(encryptedFileData, key, iv)
  let decryptedFile = new File([decryptedFileData], file.name, {
    type: file.type,
  })
  return decryptedFile
}

export const getDecryptedFile = async (
  decryptedFileData: IFileDataResponse,
  key: string,
  iv: string
) => {
  const ivUint8 = str2ua(b642str(iv))
  const aesKey = await importAESKey(str2ab(b642str(key)), [
    'encrypt',
    'decrypt',
  ])
  try {
    const encryptedFile = await getFileData(decryptedFileData)
    let decryptedFile = await decryptFile(encryptedFile, aesKey, ivUint8)
    downloadFile(decryptedFile, decryptedFileData.file_name)
  } catch (error) {
    throw new Error(error)
  }
}

async function requestSends() {
  const res = await fetch(`${APIURL}/send`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sessionStorage.getItem('token')}`,
    },
  })
  if (!res.ok) {
    throw new Error(await res.json().then((data) => data.message))
  }
  return res
}

export async function decryptData(
  data: string,
  aesKey: CryptoKey,
  iv: Uint8Array
): Promise<string> {
  // if data is empty or undefined or null return empty string
  if (!data) {
    return ''
  }
  const decryptedData = ab2str(
    await aesDecrypt(str2ab(b642str(data)), aesKey, iv)
  )
  return decryptedData
}

export const requestSendDownloadLink = async (id: String) => {
  const res = await fetch(`${APIURL}/send/${id}//download`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sessionStorage.getItem('token')}`,
    },
  })
  if (!res.ok) {
    throw new Error(await res.json().then((data) => data.message))
  }
  return await res.json().then((data) => data.link)
}
