import {
  APIURL,
  type ISendResponse,
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
    const data: ISendResponse[] = await res.json()

    // get wrapped private key from session storage
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
  let name = ''
  if (send.name !== '') {
    name = ab2str(await aesDecrypt(str2ab(b642str(send.name)), aesKey, iv))
  }
  let text_data = ''
  if (send.send_type === 0 && send.text_data !== '') {
    text_data = ab2str(
      await aesDecrypt(str2ab(b642str(send.text_data)), aesKey, iv)
    )
  }
  let file_data: IFileData = null
  if (send.send_type === 1 && send.file_data !== null) {
    file_data.name = ab2str(
      await aesDecrypt(str2ab(b642str(send.file_data.name)), aesKey, iv)
    )
    file_data.type = send.file_data.type
    file_data.id = send.file_data.id
    file_data.size = send.file_data.size
  }

  let notes = ''
  if (send.notes !== '') {
    notes = ab2str(await aesDecrypt(str2ab(b642str(send.notes)), aesKey, iv))
  }
  let password = null
  if (send.password === null) {
    password = ab2str(
      await aesDecrypt(str2ab(b642str(send.password)), aesKey, iv)
    )
  }
  const exportedAesKey = str2b64(ab2str(await exportAESKey(aesKey)))

  return {
    name,
    send_type: send.send_type,
    expiration_time: send.expiration_time,
    notes,
    password: password,
    hide_email: send.hide_email,
    disabled: send.disabled,
    max_access_count: send.max_access_count,
    access_count: send.access_count,
    creation_time: send.creation_time,
    id: send.id,
    text_data,
    file_data,
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
      throw new Error(await res.json().then((data) => data.message))
    }
    const data = await res.json()
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

// decrypt send data
export const decryptAccessTextSend = async (
  key: string,
  accessSend: IAccessSend
) => {
  const ivUint8 = str2ua(b642str(accessSend.iv))
  const aesKey = await importAESKey(str2ab(b642str(key)), [
    'encrypt',
    'decrypt',
  ])
  let decryptedTextData = ''
  if (accessSend.send_type === 0) {
    decryptedTextData = ab2str(
      await aesDecrypt(str2ab(b642str(accessSend.text_data)), aesKey, ivUint8)
    )
  }
  let decryptedFileData: IFileDataResponse = null
  if (accessSend.send_type === 1) {
    decryptedFileData.name = ab2str(
      await aesDecrypt(
        str2ab(b642str(accessSend.file_data.name)),
        aesKey,
        ivUint8
      )
    )
    decryptedFileData.type = accessSend.file_data.type
    decryptedFileData.id = accessSend.file_data.id
    decryptedFileData.size = accessSend.file_data.size
    decryptedFileData.url = accessSend.file_data.url
  }

  const decryptedName = ab2str(
    await aesDecrypt(str2ab(b642str(accessSend.name)), aesKey, ivUint8)
  )
  let decryptedEmail = ''
  if (accessSend.email.length > 0) {
    decryptedEmail = b642str(accessSend.email)
  }
  return {
    text_data: decryptedTextData,
    file_data: decryptedFileData,
    send_type: accessSend.send_type,
    email: decryptedEmail,
    name: decryptedName,
  }
}

export const decryptAccessFileSend = async (
  key: string,
  accessSend: IAccessSend
) => {
  const ivUint8 = str2ua(b642str(accessSend.iv))
  const aesKey = await importAESKey(str2ab(b642str(key)), [
    'encrypt',
    'decrypt',
  ])
  let decryptedTextData = ''
  if (accessSend.send_type === 0) {
    decryptedTextData = ab2str(
      await aesDecrypt(str2ab(b642str(accessSend.text_data)), aesKey, ivUint8)
    )
  }
  let decryptedFileData: IFileDataResponse = null
  if (accessSend.send_type === 1) {
    decryptedFileData.name = ab2str(
      await aesDecrypt(
        str2ab(b642str(accessSend.file_data.name)),
        aesKey,
        ivUint8
      )
    )
    decryptedFileData.type = accessSend.file_data.type
    decryptedFileData.id = accessSend.file_data.id
    decryptedFileData.size = accessSend.file_data.size
    decryptedFileData.url = accessSend.file_data.url
  }
  let encryptedFile
  try {
    encryptedFile = await getFileData(decryptedFileData)
    let decryptedFile = await decryptFile(encryptedFile, aesKey, ivUint8)
    downloadFile(decryptedFile, decryptedFileData.name)
  } catch (error) {
    throw new Error(error)
  }
  const decryptedName = ab2str(
    await aesDecrypt(str2ab(b642str(accessSend.name)), aesKey, ivUint8)
  )
  let decryptedEmail = ''
  if (accessSend.email.length > 0) {
    decryptedEmail = b642str(accessSend.email)
  }
  return {
    text_data: decryptedTextData,
    file_data: decryptedFileData,
    send_type: accessSend.send_type,
    email: decryptedEmail,
    name: decryptedName,
  }
}

//  send get request to s3 presigned url to get file data
export const getFileData = async (file_data: IFileDataResponse) => {
  try {
    const res = await fetch(file_data.url, {
      method: 'GET',
      headers: {
        'Content-Type': file_data.type,
      },
    })
    if (!res.ok) {
      throw new Error(await res.json().then((data) => data.message))
    }
    const data = await res.blob()
    const encryptedFile = await data.arrayBuffer()
    // create file
    const file = new File([encryptedFile], file_data.name, {
      type: file_data.type,
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
