import { APIURL, type ISend } from './types'
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

export const createSendText = async (send: ISend) => {
  // get the aes key from session storage
  console.log('createSendText inside api')

  try {
    const user = sessionStorage.getItem('user')
    if (!user) {
      throw new Error('User not logged in')
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
    let encryptedNotes = ''
    if (send.notes !== '') {
      encryptedNotes = str2b64(
        ab2str(await aesEncrypt(str2ab(send.notes), aesKey, iv))
      )
    }
    let encryptedPassword = ''
    if (send.password !== '') {
      encryptedPassword = str2b64(
        ab2str(await aesEncrypt(str2ab(send.password), aesKey, iv))
      )
    }
    // convert iv to base64
    const ivB64 = str2b64(ua2str(iv))
    // export aes key
    const encryptedAesKeyB64 = str2b64(
      ab2str(await rsaEncrypt(await exportAESKey(aesKey), public_key))
    )
    const req = {
      name: encryptedName,
      send_type: send.type,
      data: encryptedText,
      file_data: { file_name: '', file_type: '', file_size: 0 },
      hide_data: send.hideText,
      expiration_time: send.expiryDate.replace(' ', ''),
      deletion_time: send.deleteDate.replace(' ', ''),
      notes: encryptedNotes,
      password: encryptedPassword,
      hide_email: send.hideEmail,
      max_access_count: send.accessLimit ? send.accessLimit : -1,
      iv: ivB64,
      encrypted_key: encryptedAesKeyB64,
    }

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
        throw new Error(data.message)
      }
      return data
    } catch (error) {
      throw error
    }
  } catch (error) {
    throw error
  }
}

// create send with file
export const createSendFile = async (send: ISend, file: File) => {
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
    const encryptedName = str2b64(
      ab2str(await aesEncrypt(str2ab(send.name), aesKey, iv))
    )

    let encryptedNotes = ''
    if (send.notes !== '') {
      encryptedNotes = str2b64(
        ab2str(await aesEncrypt(str2ab(send.notes), aesKey, iv))
      )
    }

    let encryptedPassword = ''
    if (send.password !== '') {
      encryptedPassword = str2b64(
        ab2str(await aesEncrypt(str2ab(send.password), aesKey, iv))
      )
    }
    let enncryptedFileName = str2b64(
      ab2str(await aesEncrypt(str2ab(file.name), aesKey, iv))
    )

    let fileData = await file.arrayBuffer()

    const encryptedFileData = await aesEncrypt(fileData, aesKey, iv)
    let encryptedFile = new File([encryptedFileData], file.name, {
      type: file.type,
    })

    const ivB64 = str2b64(ua2str(iv))
    // export aes key
    const encryptedAesKeyB64 = str2b64(
      ab2str(await rsaEncrypt(await exportAESKey(aesKey), public_key))
    )

    const req = {
      name: encryptedName,
      send_type: send.type,
      data: '',
      file_data: {
        file_name: enncryptedFileName,
        file_type: encryptedFile.type,
        file_size: encryptedFile.size,
      },
      hide_data: send.hideText,
      expiration_time: send.expiryDate.replace(' ', ''),
      deletion_time: send.deleteDate.replace(' ', ''),
      notes: encryptedNotes,
      password: encryptedPassword,
      hide_email: send.hideEmail,
      max_access_count: send.accessLimit ? send.accessLimit : -1,
      iv: ivB64,
      encrypted_key: encryptedAesKeyB64,
    }

    let res = null

    try {
      res = await fetch(`${APIURL}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        },
        body: JSON.stringify(req),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.message)
      }
      // get file_data from response
      const fileData = data.Send.file_data
      // deserialize file_data to IFileDataResponse
      console.log('fileData', fileData)

      // upload file to s3 using presigned url put with content-type
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
      return data
    } catch (error) {
      throw error
    }
  } catch (error) {
    throw error
  }
}