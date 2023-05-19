import {
  APIURL,
  type ICreateSendRequest,
  type IFileDataResponse,
} from './types'
import { ab2str, b642str, str2ab, str2b64, ua2str } from '../../utils/common'
import {
  generateAESKey,
  aesEncrypt,
  exportAESKey,
} from '../../utils/crypto/aesProvider'
import {
  importPublicCryptoKey,
  rsaEncrypt,
} from '../../utils/crypto/rsaProvider'

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
      expiration_time: send.expiration_time.replace(' ', ''),
      deletion_time: send.deletion_time.replace(' ', ''),
      notes: encryptedNotes,
      password: encryptedPassword,
      hide_email: send.hide_email,
      max_access_count: send.max_access_count ? send.max_access_count : -1,
      iv: ivB64,
      encrypted_key: encryptedAesKeyB64,
    }

    let res = null

    try {
      let data = null
      res = await requestCreateNewSend(req)
      data = await res.json().Send
      const fileData: IFileDataResponse = data.file_data
      if (file && data.send_type === 1) {
        await uploadNewSendFile(fileData, encryptedFile)
      }
      return data
    } catch (error) {
      throw error
    }
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
  if (data === '') {
    return ''
  }
  const encryptedData = str2b64(
    ab2str(await aesEncrypt(str2ab(data), aesKey, iv))
  )
  return encryptedData
}
