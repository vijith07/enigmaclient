import crypto from 'crypto'


export async function aesEncrypt(
  data: ArrayBuffer,
  iv: ArrayBuffer,
  key: ArrayBuffer
): Promise<ArrayBuffer> {
  const impKey = await window.crypto.subtle.importKey(
    'raw',
    key,
    { name: 'AES-CBC' } as any,
    false,
    ['encrypt']
  )
  return await window.crypto.subtle.encrypt(
    { name: 'AES-CBC', iv: iv },
    impKey,
    data
  )
}

export async function aesDecrypt(
  data: ArrayBuffer,
  iv: ArrayBuffer,
  key: ArrayBuffer
): Promise<ArrayBuffer> {
  const impKey = await window.crypto.subtle.importKey(
    'raw',
    key,
    { name: 'AES-CBC' } as any,
    false,
    ['decrypt']
  )
  return await window.crypto.subtle.decrypt(
    { name: 'AES-CBC', iv: iv },
    impKey,
    data
  )
}