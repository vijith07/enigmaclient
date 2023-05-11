// generate AES key
export const generateAESKey = async () => {
  return await window.crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  )
}

export async function aesEncrypt(
  data: ArrayBuffer,
  key: CryptoKey,
  iv: ArrayBuffer
): Promise<ArrayBuffer> {
  return await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    data
  )
}

export async function aesDecrypt(
  data: ArrayBuffer,
  key: CryptoKey,
  iv: ArrayBuffer
): Promise<ArrayBuffer> {
  return await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    data
  )
}

export const getKeyMaterial = (password: string) => {
  const enc = new TextEncoder()
  return window.crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  )
}

export const getAESKey = async (masterPassword: string, salt: Uint8Array) => {
  const keyMaterial = await getKeyMaterial(masterPassword)
  return await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 600000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['wrapKey', 'unwrapKey']
  )
}

// export aes key
export const exportAESKey = async (key: CryptoKey) => {
  return await window.crypto.subtle.exportKey('raw', key)
}

// import aes key
export const importAESKey = async (key: ArrayBuffer, usage: KeyUsage[]) => {
  return await window.crypto.subtle.importKey(
    'raw',
    key,
    { name: 'AES-GCM', length: 256 },
    true,
    usage
  )
}
