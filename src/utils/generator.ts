// Password and passphrase generation utilities

export interface CharSets {
  uppercase: string
  lowercase: string
  numbers: string
  symbols: string
}

export const charSets: CharSets = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
}

export interface PasswordOptions {
  length: number
  includeUppercase: boolean
  includeLowercase: boolean
  includeNumbers: boolean
  includeSymbols: boolean
}

export interface PassphraseOptions {
  wordCount: number
  separator: string
  capitalizeWords: boolean
  includeNumber: boolean
}

/**
 * Get a cryptographically secure random integer from 0 to max-1
 */
export const getRandomInt = (max: number): number => {
  const array = new Uint32Array(1)
  crypto.getRandomValues(array)
  return array[0] % max
}

/**
 * Generate a random password based on options
 */
export const generatePassword = (options: PasswordOptions): string | null => {
  let chars = ''
  if (options.includeUppercase) chars += charSets.uppercase
  if (options.includeLowercase) chars += charSets.lowercase
  if (options.includeNumbers) chars += charSets.numbers
  if (options.includeSymbols) chars += charSets.symbols

  if (!chars) {
    return null
  }

  const array = new Uint32Array(options.length)
  crypto.getRandomValues(array)

  let result = ''
  for (let i = 0; i < options.length; i++) {
    result += chars[array[i] % chars.length]
  }
  return result
}

/**
 * Generate a random passphrase based on options
 */
export const generatePassphrase = (
  wordlist: string[],
  options: PassphraseOptions
): string => {
  const words: string[] = []

  for (let i = 0; i < options.wordCount; i++) {
    let word = wordlist[getRandomInt(wordlist.length)]
    if (options.capitalizeWords) {
      word = word.charAt(0).toUpperCase() + word.slice(1)
    }
    words.push(word)
  }

  let result = words.join(options.separator)

  if (options.includeNumber) {
    const num = getRandomInt(100)
    result += options.separator + num
  }

  return result
}

/**
 * Calculate password strength score (0-6)
 */
export const calculateStrengthScore = (
  password: string,
  isPassphrase: boolean = false,
  passphraseOptions?: PassphraseOptions
): number => {
  if (!password) return 0

  if (isPassphrase && passphraseOptions) {
    let score = passphraseOptions.wordCount
    if (passphraseOptions.capitalizeWords) score += 1
    if (passphraseOptions.includeNumber) score += 1
    return Math.min(score, 6)
  }

  let score = 0
  if (password.length >= 12) score++
  if (password.length >= 16) score++
  if (/[A-Z]/.test(password)) score++
  if (/[a-z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  return score
}

/**
 * Get strength text based on score
 */
export const getStrengthText = (score: number): string => {
  if (score <= 2) return '⚠️ Weak'
  if (score <= 4) return '🔶 Medium'
  if (score <= 5) return '✅ Strong'
  return '🛡️ Very Strong'
}

/**
 * Get strength CSS class based on score
 */
export const getStrengthClass = (score: number): string => {
  if (score <= 2) return 'strength-weak'
  if (score <= 4) return 'strength-medium'
  if (score <= 5) return 'strength-strong'
  return 'strength-very-strong'
}
