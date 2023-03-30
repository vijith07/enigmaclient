// password strength calculator function
export const passwordStrengthCalculator = (password: string) => {
  let strength = 0

  if (password.length < 6) {
    return strength
  }
  if (password.length > 6) {
    strength += 1
  }

  if (password.length > 8) {
    strength += 1
  }

  if (password.length > 12) {
    strength += 2
  }

  if (password.length > 16) {
    strength += 1
  }

  if (password.match(/[a-z]+/)) {
    strength += 1
  }
  if (password.match(/[A-Z]+/)) {
    strength += 1
  }
  if (password.match(/[0-9]+/)) {
    strength += 1
  }
  if (password.match(/[$@#&!]+/)) {
    strength += 2
  }
  return strength*10
}

// generate random password function with length and  disallowed characters
export const generateRandomPassword = (
    length: number,
    disallowedCharacters: string
    ) => {
    let result = ''
    const characters =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+'
    // remove disallowed characters
    for (let i = 0; i < disallowedCharacters.length; i++) {
        const char = disallowedCharacters[i]
        const regex = new RegExp(char, 'g')
        characters.replace(regex, '')
    }
    const charactersLength = characters.length
    for (let i = 0; i < length; i++) {
        result += characters.charAt(
            Math.floor(Math.random() * charactersLength)
        )
    }
    return result
}
