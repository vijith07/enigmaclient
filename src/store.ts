import { writable } from 'svelte/store'

export const userAuth = writable({
  public_key: '',
  email: '',
  wrapped_private_key: '',
  iv: '',
  salt: '',
  name: '',
  email_verified: false,
  aes_key: '',
  token: '',
  isLoggedIn: false,
  isRegistered: false,
  isVerified: false,
  isAuthenticating: false,
  isRegistering: false,
  isVerifying: false,
  isLoggingOut: false,
  error: '',
  success: '',
})
