import {
  APIURL,
  type ICreateSendRequest,
  type IFileDataResponse,
  type ISend,
  type IUpdateSendRequest,
} from './types'
import {
  ab2str,
  b642str,
  str2ab,
  str2b64,
  str2ua,
  ua2str,
} from '../../utils/common'
import {
  generateAESKey,
  aesEncrypt,
  exportAESKey,
  importAESKey,
} from '../../utils/crypto/aesProvider'
import {
  importPublicCryptoKey,
  rsaEncrypt,
} from '../../utils/crypto/rsaProvider'
import { convertToNaiveDateTime } from '../../utils/dateTime'
import { decryptData } from './getSend'

export const createSend = async (send: ICreateSendRequest, file?: File) => {
  try {
    const user = sessionStorage.getItem('user')
    if (!user) {
      throw new Error('User not logged in')
    }
    const userData = JSON.parse(user)

    const public_key = await importPublicCryptoKey(
      str2ab(b642str(userData.public_key))
    )

    // denerate new aes key and iv
    const iv = window.crypto.getRandomValues(new Uint8Array(12))

    // generate new aes key
    const aesKey = await generateAESKey()

    // encrypt each field
    const encryptedName = await encryptData(send.name, aesKey, iv)

    const encryptedNotes = await encryptData(send.notes, aesKey, iv)

    const encryptedPassword = await encryptData(send.password, aesKey, iv)

    const encryptedTextData = await encryptData(send.text_data, aesKey, iv)

    let encryptedFile = await encryptFile(file, aesKey, iv)

    const ivB64 = str2b64(ua2str(iv))
    // export aes key
    const encryptedAesKeyB64 = str2b64(
      ab2str(await rsaEncrypt(await exportAESKey(aesKey), public_key))
    )
    const req: ICreateSendRequest = {
      name: encryptedName,
      send_type: send.send_type,
      text_data: send.text_data ? encryptedTextData : '',
      file_data: {
        file_name: file ? encryptedFile.name : '',
        file_type: file ? file.type : '',
        file_size: file ? file.size : 0,
      },
      hide_data: send.hide_data,
      expiration_time: convertToNaiveDateTime(send.expiration_time),
      deletion_time: convertToNaiveDateTime(send.deletion_time),
      notes: encryptedNotes,
      password: encryptedPassword,
      hide_email: send.hide_email,
      max_access_count: send.max_access_count ? send.max_access_count : -1,
      iv: ivB64,
      encrypted_key: encryptedAesKeyB64,
    }
    const res = await requestCreateNewSend(req)
    const data = await res.json().then((d) => d.send)
    const fileData: IFileDataResponse = data.file_data
    if (file && data.send_type === 1) {
      await uploadNewSendFile(fileData, encryptedFile)
    }
    return data
  } catch (error) {
    throw error
  }
}

export const updateSend = async (send: ISend): Promise<boolean> => {
  try {
    const user = sessionStorage.getItem('user')
    if (!user) {
      throw new Error('User not logged in')
    }
    const userData = JSON.parse(user)
    const public_key = await importPublicCryptoKey(
      str2ab(b642str(userData.public_key))
    )
    const aesKey = await importAESKey(str2ab(b642str(send.encrypted_key)), [
      'encrypt',
      'decrypt',
    ])

    const encryptedAesKeyB64 = str2b64(
      ab2str(await rsaEncrypt(await exportAESKey(aesKey), public_key))
    )

    const iv = str2ua(b642str(send.iv))
    send.name = await encryptData(send.name, aesKey, iv)
    send.notes = await encryptData(send.notes, aesKey, iv)
    send.password = await encryptData(send.password, aesKey, iv)
    send.text_data = await encryptData(send.text_data, aesKey, iv)
    send.encrypted_key = encryptedAesKeyB64
    const res = await requestUpdateSend(send)
    const data = await res.json().then((d) => d.Send)
    return data
  } catch (error) {
    throw error
  }
}

const uploadNewSendFile = async (
  fileData: IFileDataResponse,
  encryptedFile: File
): Promise<Response> => {
  const uploadRes = await fetch(fileData.url, {
    method: 'PUT',
    headers: {
      'Content-Type': encryptedFile.type,
    },
    body: encryptedFile,
  })
  if (!uploadRes.ok) {
    throw new Error('Error uploading file')
  }
  return uploadRes
}
const requestCreateNewSend = async (
  req: ICreateSendRequest
): Promise<Response> => {
  const res = await fetch(`${APIURL}/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sessionStorage.getItem('token')}`,
    },
    body: JSON.stringify(req),
  })

  if (!res.ok) {
    throw new Error(res.statusText)
  }
  return res
}

const requestUpdateSend = async (req: ISend): Promise<Response> => {
  // convert req to IUpdateSendRequest
  const updateReq: IUpdateSendRequest = {
    id: req.id,
    name: req.name,
    text_data: req.text_data,
    notes: req.notes,
    password: req.password,
    hide_email: req.hide_email,
    hide_data: req.hide_data,
    expiration_time: convertToNaiveDateTime(req.expiration_time),
    deletion_time: convertToNaiveDateTime(req.deletion_time),
    max_access_count: req.max_access_count ? req.max_access_count : -1,
    encrypted_key: req.encrypted_key,
    iv: req.iv,
  }
  const res = await fetch(`${APIURL}/send/${req.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sessionStorage.getItem('token')}`,
    },
    body: JSON.stringify(updateReq),
  })

  if (!res.ok) {
    throw new Error(res.statusText)
  }
  return res
}

const encryptFile = async (
  file: File,
  aesKey: CryptoKey,
  iv: Uint8Array
): Promise<File> => {
  let encryptedFile = null
  if (file) {
    let encryptedFileName = await encryptData(file.name, aesKey, iv)
    let fileData = await file.arrayBuffer()
    const encryptedFileData = await aesEncrypt(fileData, aesKey, iv)
    encryptedFile = new File([encryptedFileData], encryptedFileName, {
      type: file.type,
    })
  }
  return encryptedFile
}

async function encryptData(
  data: string,
  aesKey: CryptoKey,
  iv: Uint8Array
): Promise<string> {
  if (!data) {
    return ''
  }
  const encryptedData = str2b64(
    ab2str(await aesEncrypt(str2ab(data), aesKey, iv))
  )
  return encryptedData
}
