<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { wordlist } from '../wordlist'
import {
  generatePassword as genPassword,
  generatePassphrase as genPassphrase,
  calculateStrengthScore,
  getStrengthText as getStrText,
  getStrengthClass as getStrClass
} from '../utils/generator'

const VERSION = __APP_VERSION__
const STORAGE_KEY = 'password-generator-settings'

type GeneratorMode = 'password' | 'passphrase'

interface StoredSettings {
  mode: GeneratorMode
  length: number
  includeUppercase: boolean
  includeLowercase: boolean
  includeNumbers: boolean
  includeSymbols: boolean
  wordCount: number
  separator: string
  capitalizeWords: boolean
  includeNumber: boolean
}

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

// Load settings from localStorage
const loadSettings = (): void => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const settings: StoredSettings = JSON.parse(stored)
      mode.value = settings.mode ?? 'password'
      length.value = settings.length ?? 16
      includeUppercase.value = settings.includeUppercase ?? true
      includeLowercase.value = settings.includeLowercase ?? true
      includeNumbers.value = settings.includeNumbers ?? true
      includeSymbols.value = settings.includeSymbols ?? true
      wordCount.value = settings.wordCount ?? 4
      separator.value = settings.separator ?? '-'
      capitalizeWords.value = settings.capitalizeWords ?? true
      includeNumber.value = settings.includeNumber ?? true
    }
  } catch {
    // Ignore localStorage errors
  }
}

// Save settings to localStorage
const saveSettings = (): void => {
  try {
    const settings: StoredSettings = {
      mode: mode.value,
      length: length.value,
      includeUppercase: includeUppercase.value,
      includeLowercase: includeLowercase.value,
      includeNumbers: includeNumbers.value,
      includeSymbols: includeSymbols.value,
      wordCount: wordCount.value,
      separator: separator.value,
      capitalizeWords: capitalizeWords.value,
      includeNumber: includeNumber.value
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch {
    // Ignore localStorage errors
  }
}

// Watch all settings and save on change
watch(
  [mode, length, includeUppercase, includeLowercase, includeNumbers, includeSymbols,
   wordCount, separator, capitalizeWords, includeNumber],
  saveSettings
)

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
  // Ensure shake detection is set up (iOS requires user gesture)
  ensureShakeDetection()
  
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

// Shake detection for mobile devices
const SHAKE_THRESHOLD = 12
const SHAKE_TIMEOUT = 800
let lastShakeTime = 0
let shakeCount = 0
let lastAcceleration = 0

const handleDeviceMotion = (event: DeviceMotionEvent): void => {
  // Try accelerationIncludingGravity first, fall back to acceleration
  const accel = event.accelerationIncludingGravity || event.acceleration
  if (!accel) return

  const x = accel.x ?? 0
  const y = accel.y ?? 0
  const z = accel.z ?? 0

  // Calculate total acceleration magnitude
  const acceleration = Math.sqrt(x * x + y * y + z * z)
  const delta = Math.abs(acceleration - lastAcceleration)
  lastAcceleration = acceleration

  // Detect significant movement
  if (delta > SHAKE_THRESHOLD) {
    shakeCount++
    
    // Require 2 quick movements to count as a shake
    if (shakeCount >= 2) {
      const now = Date.now()
      if (now - lastShakeTime > SHAKE_TIMEOUT) {
        lastShakeTime = now
        shakeCount = 0
        generate()
      }
    }
    
    // Reset shake count after a delay
    setTimeout(() => {
      shakeCount = Math.max(0, shakeCount - 1)
    }, 400)
  }
}

const setupShakeDetection = (): void => {
  // Check if DeviceMotionEvent is available
  if (!('DeviceMotionEvent' in window)) return

  // iOS 13+ requires permission (must be called from user gesture)
  const DeviceMotionEventWithPermission = DeviceMotionEvent as typeof DeviceMotionEvent & {
    requestPermission?: () => Promise<'granted' | 'denied'>
  }

  if (typeof DeviceMotionEventWithPermission.requestPermission === 'function') {
    // Will be set up via user interaction
    return
  }
  
  // Non-iOS - works without permission
  window.addEventListener('devicemotion', handleDeviceMotion)
}

const requestMotionPermission = async (): Promise<void> => {
  const DeviceMotionEventWithPermission = DeviceMotionEvent as typeof DeviceMotionEvent & {
    requestPermission?: () => Promise<'granted' | 'denied'>
  }

  if (typeof DeviceMotionEventWithPermission.requestPermission === 'function') {
    try {
      const permission = await DeviceMotionEventWithPermission.requestPermission()
      if (permission === 'granted') {
        window.addEventListener('devicemotion', handleDeviceMotion)
      }
    } catch {
      // Permission denied or error
    }
  }
}

// Track if we've already requested permission
let permissionRequested = false

const ensureShakeDetection = (): void => {
  if (permissionRequested) return
  permissionRequested = true
  requestMotionPermission()
}

// Changelog popup
interface ChangelogEntry {
  version: string
  date: string
  sections: { title: string; items: string[] }[]
}

const LAST_SEEN_VERSION_KEY = 'password-generator-last-seen-version'
const showChangelog = ref<boolean>(false)
const changelog = ref<ChangelogEntry[]>([])

const fetchChangelog = async (): Promise<void> => {
  try {
    const response = await fetch('/changelog.json')
    if (response.ok) {
      changelog.value = await response.json()
    }
  } catch {
    // Ignore fetch errors
  }
}

const openChangelog = (): void => {
  showChangelog.value = true
  if (changelog.value.length === 0) {
    fetchChangelog()
  }
}

const closeChangelog = (): void => {
  showChangelog.value = false
  // Mark current version as seen
  try {
    localStorage.setItem(LAST_SEEN_VERSION_KEY, VERSION)
  } catch {
    // Ignore localStorage errors
  }
}

const checkForNewVersion = (): void => {
  try {
    const lastSeenVersion = localStorage.getItem(LAST_SEEN_VERSION_KEY)
    if (lastSeenVersion !== VERSION) {
      // New version detected, show changelog
      openChangelog()
    }
  } catch {
    // Ignore localStorage errors
  }
}

// Load settings and generate initial output on mount
onMounted(() => {
  loadSettings()
  generate()
  // For non-iOS, set up immediately
  setupShakeDetection()
  // Check if we should show changelog for new version
  checkForNewVersion()
})

onUnmounted(() => {
  window.removeEventListener('devicemotion', handleDeviceMotion)
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

    <div class="version-info" @click="openChangelog">v{{ VERSION }}</div>

    <!-- Changelog Modal -->
    <div v-if="showChangelog" class="changelog-overlay" @click.self="closeChangelog">
      <div class="changelog-modal">
        <button class="changelog-close" @click="closeChangelog">&times;</button>
        <h2 class="changelog-title">Changelog</h2>
        <div class="changelog-content">
          <div v-if="changelog.length === 0" class="changelog-loading">
            Loading...
          </div>
          <div v-for="entry in changelog" :key="entry.version" class="changelog-entry">
            <h3 class="changelog-version">{{ entry.version }} <span class="changelog-date">{{ entry.date }}</span></h3>
            <div v-for="section in entry.sections" :key="section.title" class="changelog-section">
              <h4>{{ section.title }}</h4>
              <ul>
                <li v-for="(item, index) in section.items" :key="index">{{ item }}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
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
  cursor: pointer;
  transition: color 0.2s;
}

.version-info:hover {
  color: #0f3460;
  text-decoration: underline;
}

/* Changelog Modal */
.changelog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
}

.changelog-modal {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  position: relative;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.changelog-close {
  position: absolute;
  top: 12px;
  right: 12px;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #6c757d;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.changelog-close:hover {
  background: #f0f0f0;
  color: #212529;
}

.changelog-title {
  padding: 20px 20px 10px;
  margin: 0;
  color: #1a1a2e;
  font-size: 1.3rem;
  border-bottom: 1px solid #e9ecef;
}

.changelog-content {
  padding: 15px 20px 20px;
  overflow-y: auto;
  flex: 1;
}

.changelog-loading {
  text-align: center;
  color: #6c757d;
  padding: 20px;
}

.changelog-entry {
  margin-bottom: 20px;
}

.changelog-entry:last-child {
  margin-bottom: 0;
}

.changelog-version {
  color: #0f3460;
  font-size: 1.1rem;
  margin: 0 0 10px 0;
}

.changelog-date {
  font-weight: normal;
  color: #6c757d;
  font-size: 0.85rem;
}

.changelog-section h4 {
  color: #495057;
  font-size: 0.9rem;
  margin: 8px 0 4px 0;
}

.changelog-section ul {
  margin: 0;
  padding-left: 20px;
  color: #495057;
}

.changelog-section li {
  font-size: 0.85rem;
  margin-bottom: 2px;
}

/* Mobile Responsive Styles */
@media (max-width: 480px) {
  .container {
    padding: 18px 16px;
    border-radius: 12px;
  }

  h1 {
    font-size: 1.4rem;
    margin-bottom: 14px;
  }

  .mode-toggle {
    margin-bottom: 14px;
  }

  .mode-btn {
    padding: 9px 12px;
    font-size: 0.9rem;
  }

  .password-display {
    padding: 12px 14px;
    margin-bottom: 12px;
    gap: 10px;
  }

  .password-text {
    font-size: 1.05rem;
    min-height: 22px;
  }

  .copy-btn {
    padding: 9px 14px;
    font-size: 0.85rem;
  }

  .settings {
    margin-bottom: 14px;
  }

  .setting-row {
    padding: 9px 0;
  }

  .setting-label {
    font-size: 0.9rem;
  }

  .length-control {
    gap: 12px;
  }

  .length-slider {
    width: 110px;
  }

  .length-value {
    min-width: 26px;
    font-size: 0.95rem;
  }

  .separator-select {
    padding: 6px 10px;
    font-size: 0.9rem;
  }

  .toggle-switch {
    width: 46px;
    height: 24px;
  }

  .toggle-slider:before {
    height: 18px;
    width: 18px;
  }

  input:checked + .toggle-slider:before {
    transform: translateX(22px);
  }

  .generate-btn {
    padding: 13px;
    font-size: 1rem;
    letter-spacing: 0.5px;
  }

  .strength-indicator {
    margin-top: -6px;
    margin-bottom: 12px;
    padding: 7px;
    font-size: 0.85rem;
  }

  .version-info {
    margin-top: 12px;
    font-size: 0.7rem;
  }

  .changelog-overlay {
    padding: 10px;
  }

  .changelog-modal {
    max-height: 85vh;
  }

  .changelog-title {
    padding: 16px 16px 10px;
    font-size: 1.15rem;
  }

  .changelog-content {
    padding: 12px 16px 16px;
  }

  .changelog-version {
    font-size: 1rem;
  }
}

/* Extra small devices */
@media (max-width: 360px) {
  .container {
    padding: 14px 12px;
  }

  h1 {
    font-size: 1.25rem;
    margin-bottom: 12px;
  }

  .mode-btn {
    padding: 7px 10px;
    font-size: 0.85rem;
  }

  .password-text {
    font-size: 0.95rem;
  }

  .setting-row {
    padding: 7px 0;
  }

  .setting-label {
    font-size: 0.85rem;
  }

  .generate-btn {
    padding: 11px;
    font-size: 0.95rem;
  }
}
</style>
