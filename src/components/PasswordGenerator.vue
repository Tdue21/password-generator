<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { wordlist } from '../wordlist'
import {
  generatePassword as genPassword,
  generatePassphrase as genPassphrase,
  calculateStrengthScore,
  getStrengthText as getStrText,
  getStrengthClass as getStrClass
} from '../utils/generator'

const VERSION = __APP_VERSION__

type GeneratorMode = 'password' | 'passphrase'

// Common state
const output = ref<string>('')
const justCopied = ref<boolean>(false)
const mode = ref<GeneratorMode>('password')

// Password options
const length = ref<number>(16)
const includeUppercase = ref<boolean>(true)
const includeLowercase = ref<boolean>(true)
const includeNumbers = ref<boolean>(true)
const includeSymbols = ref<boolean>(true)

// Passphrase options
const wordCount = ref<number>(4)
const separator = ref<string>('-')
const capitalizeWords = ref<boolean>(true)
const includeNumber = ref<boolean>(true)

const generatePassword = (): void => {
  const result = genPassword({
    length: length.value,
    includeUppercase: includeUppercase.value,
    includeLowercase: includeLowercase.value,
    includeNumbers: includeNumbers.value,
    includeSymbols: includeSymbols.value
  })

  if (result === null) {
    alert('Please select at least one character type')
    return
  }

  output.value = result
}

const generatePassphrase = (): void => {
  output.value = genPassphrase(wordlist, {
    wordCount: wordCount.value,
    separator: separator.value,
    capitalizeWords: capitalizeWords.value,
    includeNumber: includeNumber.value
  })
}

const generate = (): void => {
  if (mode.value === 'password') {
    generatePassword()
  } else {
    generatePassphrase()
  }
}

const copyToClipboard = async (): Promise<void> => {
  if (!output.value) return

  try {
    await navigator.clipboard.writeText(output.value)
    justCopied.value = true
    setTimeout(() => {
      justCopied.value = false
    }, 2000)
  } catch {
    const textarea = document.createElement('textarea')
    textarea.value = output.value
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    justCopied.value = true
    setTimeout(() => {
      justCopied.value = false
    }, 2000)
  }
}

const strengthScore = computed<number>(() => {
  if (!output.value) return 0
  
  if (mode.value === 'passphrase') {
    return calculateStrengthScore(output.value, true, {
      wordCount: wordCount.value,
      separator: separator.value,
      capitalizeWords: capitalizeWords.value,
      includeNumber: includeNumber.value
    })
  }
  
  return calculateStrengthScore(output.value)
})

const strengthText = computed<string>(() => {
  return getStrText(strengthScore.value)
})

const strengthClass = computed<string>(() => {
  return getStrClass(strengthScore.value)
})

// Generate initial output on mount
onMounted(() => {
  generate()
})
</script>

<template>
  <div class="container">
    <h1>🔐 Password Generator</h1>

    <!-- Mode Toggle -->
    <div class="mode-toggle">
      <button
        class="mode-btn"
        :class="{ active: mode === 'password' }"
        @click="mode = 'password'; generate()"
      >
        Password
      </button>
      <button
        class="mode-btn"
        :class="{ active: mode === 'passphrase' }"
        @click="mode = 'passphrase'; generate()"
      >
        Passphrase
      </button>
    </div>

    <div class="password-display">
      <div class="password-text">{{ output || 'Click Generate' }}</div>
      <button
        class="copy-btn"
        :class="{ copied: justCopied }"
        :disabled="!output"
        @click="copyToClipboard"
      >
        {{ justCopied ? 'Copied!' : 'Copy' }}
      </button>
    </div>

    <div v-if="output" class="strength-indicator" :class="strengthClass">
      {{ strengthText }}
    </div>

    <!-- Password Settings -->
    <div v-if="mode === 'password'" class="settings">
      <div class="setting-row">
        <span class="setting-label">Password Length</span>
        <div class="length-control">
          <input
            v-model="length"
            type="range"
            class="length-slider"
            min="8"
            max="64"
          />
          <span class="length-value">{{ length }}</span>
        </div>
      </div>

      <div class="setting-row">
        <span class="setting-label">Uppercase (A-Z)</span>
        <label class="toggle-switch">
          <input v-model="includeUppercase" type="checkbox" />
          <span class="toggle-slider"></span>
        </label>
      </div>

      <div class="setting-row">
        <span class="setting-label">Lowercase (a-z)</span>
        <label class="toggle-switch">
          <input v-model="includeLowercase" type="checkbox" />
          <span class="toggle-slider"></span>
        </label>
      </div>

      <div class="setting-row">
        <span class="setting-label">Numbers (0-9)</span>
        <label class="toggle-switch">
          <input v-model="includeNumbers" type="checkbox" />
          <span class="toggle-slider"></span>
        </label>
      </div>

      <div class="setting-row">
        <span class="setting-label">Symbols (!@#$%^&*)</span>
        <label class="toggle-switch">
          <input v-model="includeSymbols" type="checkbox" />
          <span class="toggle-slider"></span>
        </label>
      </div>
    </div>

    <!-- Passphrase Settings -->
    <div v-if="mode === 'passphrase'" class="settings">
      <div class="setting-row">
        <span class="setting-label">Word Count</span>
        <div class="length-control">
          <input
            v-model="wordCount"
            type="range"
            class="length-slider"
            min="3"
            max="8"
          />
          <span class="length-value">{{ wordCount }}</span>
        </div>
      </div>

      <div class="setting-row">
        <span class="setting-label">Separator</span>
        <select v-model="separator" class="separator-select">
          <option value="-">Hyphen (-)</option>
          <option value="_">Underscore (_)</option>
          <option value=".">Period (.)</option>
          <option value=" ">Space</option>
          <option value="">None</option>
        </select>
      </div>

      <div class="setting-row">
        <span class="setting-label">Capitalize Words</span>
        <label class="toggle-switch">
          <input v-model="capitalizeWords" type="checkbox" />
          <span class="toggle-slider"></span>
        </label>
      </div>

      <div class="setting-row">
        <span class="setting-label">Include Number</span>
        <label class="toggle-switch">
          <input v-model="includeNumber" type="checkbox" />
          <span class="toggle-slider"></span>
        </label>
      </div>
    </div>

    <button class="generate-btn" @click="generate">
      Generate {{ mode === 'password' ? 'Password' : 'Passphrase' }}
    </button>

    <div class="version-info">v{{ VERSION }}</div>
  </div>
</template>

<style scoped>
.container {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 40px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

h1 {
  text-align: center;
  color: #1a1a2e;
  margin-bottom: 20px;
  font-size: 1.8rem;
}

.mode-toggle {
  display: flex;
  gap: 0;
  margin-bottom: 20px;
  border-radius: 10px;
  overflow: hidden;
  border: 2px solid #0f3460;
}

.mode-btn {
  flex: 1;
  padding: 12px 20px;
  border: none;
  background: white;
  color: #0f3460;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.mode-btn:hover {
  background: #f0f4f8;
}

.mode-btn.active {
  background: #0f3460;
  color: white;
}

.password-display {
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  padding: 15px 20px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.password-text {
  flex: 1;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 1.2rem;
  word-break: break-all;
  color: #212529;
  min-height: 30px;
}

.copy-btn {
  background: #0f3460;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
  white-space: nowrap;
}

.copy-btn:hover {
  background: #1a4f8b;
  transform: scale(1.05);
}

.copy-btn.copied {
  background: #28a745;
}

.copy-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.settings {
  margin-bottom: 25px;
}

.setting-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #e9ecef;
}

.setting-row:last-child {
  border-bottom: none;
}

.setting-label {
  color: #495057;
  font-size: 1rem;
}

.length-control {
  display: flex;
  align-items: center;
  gap: 15px;
}

.length-slider {
  width: 150px;
  height: 6px;
  -webkit-appearance: none;
  appearance: none;
  background: #dee2e6;
  border-radius: 3px;
  outline: none;
}

.length-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  background: #0f3460;
  border-radius: 50%;
  cursor: pointer;
}

.length-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  background: #0f3460;
  border-radius: 50%;
  cursor: pointer;
  border: none;
}

.length-value {
  font-weight: bold;
  color: #0f3460;
  min-width: 30px;
  text-align: center;
}

.separator-select {
  padding: 8px 12px;
  border: 2px solid #dee2e6;
  border-radius: 8px;
  font-size: 0.95rem;
  color: #495057;
  background: white;
  cursor: pointer;
  outline: none;
  transition: border-color 0.2s;
}

.separator-select:focus {
  border-color: #0f3460;
}

.toggle-switch {
  position: relative;
  width: 50px;
  height: 26px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #dee2e6;
  transition: 0.3s;
  border-radius: 26px;
}

.toggle-slider:before {
  position: absolute;
  content: '';
  height: 20px;
  width: 20px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

input:checked + .toggle-slider {
  background-color: #0f3460;
}

input:checked + .toggle-slider:before {
  transform: translateX(24px);
}

.generate-btn {
  width: 100%;
  background: linear-gradient(135deg, #0f3460 0%, #1a4f8b 100%);
  color: white;
  border: none;
  padding: 16px;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.generate-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(15, 52, 96, 0.4);
}

.generate-btn:active {
  transform: translateY(0);
}

.strength-indicator {
  margin-top: -10px;
  margin-bottom: 15px;
  padding: 10px;
  border-radius: 8px;
  text-align: center;
  font-weight: 500;
}

.strength-weak {
  background: #ffebee;
  color: #c62828;
}

.strength-medium {
  background: #fff3e0;
  color: #ef6c00;
}

.strength-strong {
  background: #e8f5e9;
  color: #2e7d32;
}

.strength-very-strong {
  background: #e3f2fd;
  color: #1565c0;
}

.version-info {
  margin-top: 15px;
  text-align: center;
  font-size: 0.75rem;
  color: #adb5bd;
}
</style>
