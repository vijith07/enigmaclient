export function ab2str(buffer: ArrayBuffer): string {
  return String.fromCharCode.apply(null, new Uint8Array(buffer))
}

export function str2ab(str: string): ArrayBuffer {
  const buf = new ArrayBuffer(str.length)
  const bufView = new Uint8Array(buf)
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i)
  }
  return buf
}

// string to base64
export function str2b64(str: string): string {
  return window.btoa(str)
}

// base64 to string
export function b642str(b64: string): string {
  return window.atob(b64)
}

// string to Uint8Array
export function str2ua(str: string): Uint8Array {
  return new Uint8Array(str2ab(str))
}

// Uint8Array to string
export function ua2str(ua: Uint8Array): string {
  return ab2str(ua.buffer)
}