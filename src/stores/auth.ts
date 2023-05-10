// contains store realted to auth

import { writable, derived } from 'svelte/store'

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

export const userAuthStore = {
  subscribe: userAuth.subscribe,
  set: userAuth.set,
  update: userAuth.update,
  reset: () => {
    userAuth.set({
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
  },
  setAuthenticating: (value: boolean) => {
    userAuth.update((val) => {
      val.isAuthenticating = value
      return val
    })
  },
  setRegistering: (value: boolean) => {
    userAuth.update((val) => {
      val.isRegistering = value
      return val
    })
  },
  setVerifying: (value: boolean) => {
    userAuth.update((val) => {
      val.isVerifying = value
      return val
    })
  },
  setLoggingOut: (value: boolean) => {
    userAuth.update((val) => {
      val.isLoggingOut = value
      return val
    })
  },
}

// userinfo derived store if user is logged in
export const userInfo = derived(userAuth, ($userAuth) => {
  return $userAuth.isLoggedIn
    ? {
        email: $userAuth.email,
        name: $userAuth.name,
        email_verified: $userAuth.email_verified,
      }
    : {}
})
