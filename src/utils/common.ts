import * as forge from 'node-forge'

export function fromUtf8ToArray(str: string): Uint8Array {
  const strUtf8 = unescape(encodeURIComponent(str))
  const arr = new Uint8Array(strUtf8.length)
  for (let i = 0; i < strUtf8.length; i++) {
    arr[i] = strUtf8.charCodeAt(i)
  }
  return arr
}
export function toBuf(value: string | ArrayBuffer) {
  return typeof value === 'string' ? fromUtf8ToArray(value) : value
}

export function toByteString(value: string | ArrayBuffer): string {
  let bytes: string
  if (typeof value === 'string') {
    bytes = forge.util.encodeUtf8(value)
  } else {
    bytes = fromBufferToByteString(value)
  }
  return bytes
}

export function fromBufferToByteString(buffer: ArrayBuffer): string {
  return String.fromCharCode.apply(null, new Uint8Array(buffer))
}
