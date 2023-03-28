import { toBuf } from './common'

export async function generatePBKDF2Hash(
  password: string | ArrayBuffer,
  salt: string | ArrayBuffer,
  iterations: number,
  algorithm: 'sha256' | 'sha512'
) {
  const wcLen = algorithm === 'sha256' ? 256 : 512
  const passwordBuffer = toBuf(password)
  const saltBuffer = toBuf(salt)
  const pbkdf2Params = {
    name: 'PBKDF2',
    salt: saltBuffer,
    iterations,
    hash: algorithm === 'sha256' ? 'SHA-256' : 'SHA-512',
  }

  const impKey = await window.crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    { name: 'PBKDF2' } as any,
    false,
    ['deriveBits']
  )
  return await window.crypto.subtle.deriveBits(pbkdf2Params, impKey, wcLen)
}
