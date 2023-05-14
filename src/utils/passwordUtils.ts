// password strength calculator function
import z from 'zxcvbn'

export type PasswordStrength = {
  strength: number
  message: string
  suggestions: string[]
  warning?: string 
  timeToCrack?: string 
}
export const passwordStrengthCalculator = (password: string) => {
  const res = z(password)
  const strength = res.score * 20 + (password.length > 11 ? 20 : 0)
  const suggestions = res.feedback.suggestions || []
  const warning: string = res.feedback.warning || ''
  const timeToCrack = res.crack_times_display.offline_fast_hashing_1e10_per_second + ' to ' + res.crack_times_display.online_no_throttling_10_per_second
  const message = strength <= 20 ? 'Weak' : strength <= 40 ? 'Fair' : strength <= 60 ? 'Good' : strength <= 80 ? 'Strong' : 'Very Strong'
  return { strength, message, suggestions, warning , timeToCrack }
}