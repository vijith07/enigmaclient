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
  const strength = res.score * 25
  const suggestions = res.feedback.suggestions || []
  const warning: string = res.feedback.warning || ''
  const timeToCrack = res.crack_times_display.offline_slow_hashing_1e4_per_second || ''
  const message = strength < 25 ? 'Weak' : strength < 50 ? 'Fair' : strength < 75 ? 'Good' : 'Strong'
  return { strength, message, suggestions, warning , timeToCrack }
}