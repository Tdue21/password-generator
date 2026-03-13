import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..')

const changelogPath = join(rootDir, 'CHANGELOG.md')
const outputPath = join(rootDir, 'public', 'changelog.json')

const markdown = readFileSync(changelogPath, 'utf-8')

const entries = []
const versionRegex = /^## \[([^\]]+)\](?: - (\d{4}-\d{2}-\d{2}))?/
const sectionRegex = /^### (.+)/
const itemRegex = /^- (.+)/

let currentEntry = null
let currentSection = null

for (const line of markdown.split('\n')) {
  const versionMatch = line.match(versionRegex)
  if (versionMatch) {
    if (currentEntry) {
      entries.push(currentEntry)
    }
    currentEntry = {
      version: versionMatch[1],
      date: versionMatch[2] || '',
      sections: []
    }
    currentSection = null
    continue
  }

  if (!currentEntry) continue

  const sectionMatch = line.match(sectionRegex)
  if (sectionMatch) {
    currentSection = {
      title: sectionMatch[1],
      items: []
    }
    currentEntry.sections.push(currentSection)
    continue
  }

  const itemMatch = line.match(itemRegex)
  if (itemMatch && currentSection) {
    currentSection.items.push(itemMatch[1])
  }
}

if (currentEntry) {
  entries.push(currentEntry)
}

writeFileSync(outputPath, JSON.stringify(entries, null, 2))
console.log(`Generated ${outputPath} with ${entries.length} entries`)
