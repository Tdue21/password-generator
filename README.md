# Password Generator

[![Build and Package](https://github.com/Tdue21/password-generator/actions/workflows/build.yml/badge.svg)](https://github.com/Tdue21/password-generator/actions/workflows/build.yml)
[![Release](https://github.com/Tdue21/password-generator/actions/workflows/release.yml/badge.svg)](https://github.com/Tdue21/password-generator/actions/workflows/release.yml)

A secure password and passphrase generator with a clean, responsive web interface.

---

## Part 1: Features & User Guide

### Password Generation

Generate random passwords with configurable options:

- **Length**: 8 to 64 characters
- **Character types**: Toggle uppercase (A-Z), lowercase (a-z), numbers (0-9), and symbols (!@#$%^&*)
- At least one character type must be selected

### Passphrase Generation

Generate memorable word-based passphrases:

- **Word count**: 3 to 8 words
- **Separator**: Choose from hyphen, underscore, period, space, or none
- **Capitalize words**: Title-case each word for readability
- **Include number**: Append a random number (0-99) at the end
- Uses the EFF wordlist (~1,700 common words)

### Security

All random generation uses `crypto.getRandomValues()` for cryptographically secure randomness.

### Interface Features

- **One-click copy**: Copy generated output to clipboard instantly
- **Strength indicator**: Visual feedback showing password/passphrase strength
- **Settings persistence**: Your preferences are saved in browser localStorage
- **Shake to generate**: On mobile devices, shake your phone to generate a new password/passphrase
- **Changelog popup**: View release notes when a new version is detected (click the version number to open manually)

---

## Part 2: Self-Hosting Guide

### Quick Deploy

1. Download the latest `password-generator-deploy.zip` from [Releases](https://github.com/Tdue21/password-generator/releases)
2. Extract to your desired location
3. Install production dependencies:
   ```bash
   npm install
   ```
4. Start the server:
   ```bash
   npm start
   ```
5. Access at `http://localhost:6100`

### Configuration

The default port is **6100**. To change it:

**Option 1**: Edit the `.env` file in the extracted folder:
```
PORT=8080
```

**Option 2**: Set an environment variable:
```bash
PORT=8080 npm start
```

### Docker

Build and run with Docker:

```bash
docker build -t password-generator .
docker run -d -p 6100:6100 password-generator
```

To use a different port:

```bash
docker run -d -p 8080:8080 -e PORT=8080 password-generator
```

Or use Docker Compose (create `docker-compose.yml`):

```yaml
services:
  password-generator:
    build: .
    ports:
      - "6100:6100"
    restart: unless-stopped
```

Then run:

```bash
docker compose up -d
```

### CubeCoders AMP Setup

1. Extract the deployment ZIP to your desired location
2. Run `npm install` in that folder
3. Create a new Generic module instance in AMP
4. Set the start command to: `node server.js`
5. Set the working directory to the extracted folder
6. The port is pre-configured in `.env` (default: 6100)

### Reverse Proxy (nginx example)

```nginx
server {
    listen 80;
    server_name passwords.example.com;

    location / {
        proxy_pass http://localhost:6100;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## Part 3: Development Guide

### Prerequisites

- Node.js 18+ 
- npm

### Setup

Clone the repository and install dependencies:

```bash
git clone https://github.com/Tdue21/password-generator.git
cd password-generator
npm install
```

### Development Server

Run the Vite development server with hot reload:

```bash
npm run dev
```

Access at `http://localhost:5173`

### Building

Build for production:

```bash
npm run build
```

This compiles TypeScript, bundles the Vue app, and outputs to the `dist/` folder.

### Running Production Build Locally

Build and start the Express server:

```bash
npm start
```

Or run the server after building:

```bash
npm run server
```

### Testing

Run the test suite (Vitest):

```bash
npm test
```

Run tests in watch mode during development:

```bash
npm run test:watch
```

### Creating a Deployment Package

Run the deployment script to create a production-ready ZIP:

```powershell
.\build\deploy.ps1
```

The script:
1. Installs dependencies
2. Runs tests (aborts if any fail)
3. Builds the Vue frontend
4. Compiles the TypeScript server to JavaScript
5. Creates a minimal `deploy/` folder with only production files
6. Generates a `.env` file with the configured port
7. Creates `password-generator-deploy.zip`

### Project Structure

```
├── src/
│   ├── components/       # Vue components
│   │   └── PasswordGenerator.vue
│   ├── utils/            # Generation logic
│   │   └── generator.ts
│   ├── tests/            # Test files
│   ├── wordlist.ts       # EFF wordlist
│   ├── App.vue           # Root component
│   └── main.ts           # Entry point
├── build/
│   └── deploy.ps1        # Deployment script
├── server.ts             # Express server (TypeScript)
├── vite.config.ts        # Vite configuration
├── tsconfig.json         # TypeScript config
└── package.json          # Dependencies and scripts
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server with hot reload |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run server` | Run Express server (serves built files) |
| `npm start` | Build and run server |
| `npm test` | Run test suite |
| `npm run test:watch` | Run tests in watch mode |

### Tech Stack

- **Frontend**: Vue 3 (Composition API), TypeScript
- **Build**: Vite
- **Server**: Express.js
- **Testing**: Vitest, @vue/test-utils
- **Styling**: Scoped CSS
