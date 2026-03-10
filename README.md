# Password Generator

A Vue 3 + TypeScript password and passphrase generator with Vite and Express server.

## Features

- **Password Generation** - Configurable length (8-64 characters) with toggles for uppercase, lowercase, numbers, and symbols
- **Passphrase Generation** - Word-based passphrases (3-10 words) using the EFF wordlist (~1,700 words) with customizable separator
- Vue 3 Composition API with SFCs
- TypeScript throughout
- Cryptographically secure random generation using `crypto.getRandomValues()`
- Copy to clipboard with one click
- Password strength indicator
- Version display in UI
- Clean, responsive UI

## Quick Start

```bash
npm install
npm start
```

This builds the Vue app and starts the Express server at `http://localhost:6100`.

## Development

```bash
npm run dev
```

Runs Vite dev server with hot reload at `http://localhost:5173`.

## Testing

```bash
npm test
```

Runs the Vitest test suite (23 tests covering password/passphrase generation and strength calculation).

## Scripts

- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run server` - Run Express server (serves built files)
- `npm start` - Build and run server
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage

## Configuration

The port is configured in `package.json` under `config.port` (default: 6100). The deploy script generates a `.env` file from this value.

To override at runtime, set the `PORT` environment variable:

```bash
PORT=8080 npm run server
```

## Deployment

Run the deployment script to create a production-ready ZIP:

```powershell
.\build\deploy.ps1
```

This script:
1. Installs dependencies
2. Runs tests (exits if any fail)
3. Builds the Vue app
4. Compiles the TypeScript server
5. Creates a minimal deployment folder with production `package.json`
6. Generates a `.env` file with the configured port
7. Creates `password-generator-deploy.zip`

## AMP Setup

For CubeCoders AMP:
1. Extract the deployment ZIP to your desired location
2. Run `npm install` in that folder
3. Create a new Generic module instance
4. Set the start command to: `node server.js`
5. Set the working directory to the extracted folder
6. The port is pre-configured in `.env` (default: 6100)
