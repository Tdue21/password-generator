import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  generatePassword,
  generatePassphrase,
  calculateStrengthScore,
  getStrengthText,
  getStrengthClass,
  charSets
} from '../utils/generator'

// Mock crypto.getRandomValues for deterministic tests
const mockGetRandomValues = vi.fn()

beforeEach(() => {
  vi.stubGlobal('crypto', {
    getRandomValues: mockGetRandomValues
  })
})

describe('generatePassword', () => {
  it('should return null when no character types selected', () => {
    const result = generatePassword({
      length: 16,
      includeUppercase: false,
      includeLowercase: false,
      includeNumbers: false,
      includeSymbols: false
    })
    expect(result).toBeNull()
  })

  it('should generate password of correct length', () => {
    mockGetRandomValues.mockImplementation((arr: Uint32Array) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = i
      }
      return arr
    })

    const result = generatePassword({
      length: 20,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: true
    })

    expect(result).toHaveLength(20)
  })

  it('should only include uppercase when only uppercase selected', () => {
    mockGetRandomValues.mockImplementation((arr: Uint32Array) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = i * 3
      }
      return arr
    })

    const result = generatePassword({
      length: 10,
      includeUppercase: true,
      includeLowercase: false,
      includeNumbers: false,
      includeSymbols: false
    })

    expect(result).toMatch(/^[A-Z]+$/)
  })

  it('should only include lowercase when only lowercase selected', () => {
    mockGetRandomValues.mockImplementation((arr: Uint32Array) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = i * 2
      }
      return arr
    })

    const result = generatePassword({
      length: 10,
      includeUppercase: false,
      includeLowercase: true,
      includeNumbers: false,
      includeSymbols: false
    })

    expect(result).toMatch(/^[a-z]+$/)
  })

  it('should only include numbers when only numbers selected', () => {
    mockGetRandomValues.mockImplementation((arr: Uint32Array) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = i
      }
      return arr
    })

    const result = generatePassword({
      length: 10,
      includeUppercase: false,
      includeLowercase: false,
      includeNumbers: true,
      includeSymbols: false
    })

    expect(result).toMatch(/^[0-9]+$/)
  })

  it('should only include symbols when only symbols selected', () => {
    mockGetRandomValues.mockImplementation((arr: Uint32Array) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = i
      }
      return arr
    })

    const result = generatePassword({
      length: 10,
      includeUppercase: false,
      includeLowercase: false,
      includeNumbers: false,
      includeSymbols: true
    })

    // All characters should be symbols
    const symbolsRegex = new RegExp(`^[${charSets.symbols.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]+$`)
    expect(result).toMatch(symbolsRegex)
  })
})

describe('generatePassphrase', () => {
  const testWordlist = ['apple', 'banana', 'cherry', 'date', 'elderberry']

  it('should generate passphrase with correct word count', () => {
    mockGetRandomValues.mockImplementation((arr: Uint32Array) => {
      arr[0] = 0
      return arr
    })

    const result = generatePassphrase(testWordlist, {
      wordCount: 4,
      separator: '-',
      capitalizeWords: false,
      includeNumber: false
    })

    const words = result.split('-')
    expect(words).toHaveLength(4)
  })

  it('should use correct separator', () => {
    mockGetRandomValues.mockImplementation((arr: Uint32Array) => {
      arr[0] = 0
      return arr
    })

    const result = generatePassphrase(testWordlist, {
      wordCount: 3,
      separator: '_',
      capitalizeWords: false,
      includeNumber: false
    })

    expect(result).toContain('_')
    expect(result).not.toContain('-')
  })

  it('should capitalize words when option enabled', () => {
    mockGetRandomValues.mockImplementation((arr: Uint32Array) => {
      arr[0] = 0 // Will select 'apple'
      return arr
    })

    const result = generatePassphrase(testWordlist, {
      wordCount: 2,
      separator: '-',
      capitalizeWords: true,
      includeNumber: false
    })

    expect(result).toBe('Apple-Apple')
  })

  it('should include number when option enabled', () => {
    let callCount = 0
    mockGetRandomValues.mockImplementation((arr: Uint32Array) => {
      callCount++
      if (callCount <= 3) {
        arr[0] = 0 // Word selection
      } else {
        arr[0] = 42 // Number selection
      }
      return arr
    })

    const result = generatePassphrase(testWordlist, {
      wordCount: 3,
      separator: '-',
      capitalizeWords: false,
      includeNumber: true
    })

    expect(result).toMatch(/-\d+$/)
  })
})

describe('calculateStrengthScore', () => {
  it('should return 0 for empty password', () => {
    expect(calculateStrengthScore('')).toBe(0)
  })

  it('should give points for length >= 12', () => {
    const shortPassword = 'Aa1!'
    const mediumPassword = 'Aa1!Bb2@Cc3#'
    
    expect(calculateStrengthScore(shortPassword)).toBeLessThan(
      calculateStrengthScore(mediumPassword)
    )
  })

  it('should give points for length >= 16', () => {
    const twelveChar = 'Aa1!Bb2@Cc3#'
    const sixteenChar = 'Aa1!Bb2@Cc3#Dd4$'
    
    expect(calculateStrengthScore(sixteenChar)).toBeGreaterThan(
      calculateStrengthScore(twelveChar)
    )
  })

  it('should give points for uppercase letters', () => {
    expect(calculateStrengthScore('ABCDEFGHIJ')).toBeGreaterThan(0)
  })

  it('should give points for lowercase letters', () => {
    expect(calculateStrengthScore('abcdefghij')).toBeGreaterThan(0)
  })

  it('should give points for numbers', () => {
    expect(calculateStrengthScore('1234567890')).toBeGreaterThan(0)
  })

  it('should give points for symbols', () => {
    expect(calculateStrengthScore('!@#$%^&*()')).toBeGreaterThan(0)
  })

  it('should calculate passphrase strength based on word count', () => {
    const options = {
      wordCount: 5,
      separator: '-',
      capitalizeWords: true,
      includeNumber: true
    }
    
    // 5 words + 1 capitalize + 1 number = 7, capped at 6
    const score = calculateStrengthScore('Test-Phrase', true, options)
    expect(score).toBe(6)
  })
})

describe('getStrengthText', () => {
  it('should return Weak for score <= 2', () => {
    expect(getStrengthText(0)).toContain('Weak')
    expect(getStrengthText(1)).toContain('Weak')
    expect(getStrengthText(2)).toContain('Weak')
  })

  it('should return Medium for score 3-4', () => {
    expect(getStrengthText(3)).toContain('Medium')
    expect(getStrengthText(4)).toContain('Medium')
  })

  it('should return Strong for score 5', () => {
    expect(getStrengthText(5)).toContain('Strong')
  })

  it('should return Very Strong for score 6', () => {
    expect(getStrengthText(6)).toContain('Very Strong')
  })
})

describe('getStrengthClass', () => {
  it('should return correct CSS class for each strength level', () => {
    expect(getStrengthClass(1)).toBe('strength-weak')
    expect(getStrengthClass(3)).toBe('strength-medium')
    expect(getStrengthClass(5)).toBe('strength-strong')
    expect(getStrengthClass(6)).toBe('strength-very-strong')
  })
})
