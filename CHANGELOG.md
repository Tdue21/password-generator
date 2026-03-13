# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2026-03-13

### Added
- Auto-show changelog on first visit or after app update

## [1.1.0] - 2026-03-13

### Added
- Mobile-responsive design optimized for phones (tested on OnePlus Nord 4CE)
- Settings persistence via localStorage (remembers your preferences)
- Shake-to-generate on mobile devices (requires HTTPS)
- Changelog popup when tapping version number

### Changed
- Improved touch targets and spacing for mobile use
- Reduced UI density on small screens for better usability

## [1.0.0] - 2026-03-10

### Added
- Password generator with configurable length (8-64 characters)
- Character type toggles: uppercase, lowercase, numbers, symbols
- Passphrase generator with customizable word count (3-8 words)
- Passphrase options: separator, capitalization, include number
- Password strength indicator
- One-click copy to clipboard
- Cryptographically secure random generation using `crypto.getRandomValues()`
- Vue 3 Composition API with TypeScript
- Express server for production deployment
- Environment variable configuration via `.env` file
- PowerShell build script for deployment packaging
- AMP (CubeCoders) deployment support
