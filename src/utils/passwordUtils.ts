// password strength calculator function
type result = {
  strength: number
  message: string
  suggestions: string[]
}

export const passwordStrengthCalculator = (password: string) => {
  let strength = 0
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
  strength = strength * 10
  const suggestions: string[] = []
  //  if password is less than 12 characters long
  if (password.length < 12) {
    suggestions.push('Add more characters')
  }
  // if password does not contain a number
  if (!password.match(/[0-9]+/)) {
    suggestions.push('Add a number')
  }
  // if password does not contain a special character
  if (!password.match(/[$@#&!]+/)) {
    suggestions.push('Add a special character')
  }
  // if password does not contain a capital letter
  if (!password.match(/[A-Z]+/)) {
    suggestions.push('Add a capital letter')
  }
  // if password does not contain a lowercase letter
  if (!password.match(/[a-z]+/)) {
    suggestions.push('Add a lowercase letter')
  }

  if (strength < 25) {
    return {
      strength,
      message: 'Weak',
      suggestions,
    } as result
  }
  if (strength < 50) {
    return {
      strength,
      message: 'Medium',
      suggestions,
    } as result
  }
  if (strength < 75) {
    return {
      strength,
      message: 'Strong',
      suggestions,
    } as result
  }
  return {
    strength,
    message: 'Very Strong',
    suggestions,
  } as result
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
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}
