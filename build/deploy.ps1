# Password Generator - Deployment Build Script
# This script prepares the application for deployment

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$OutputDir = Join-Path $ProjectRoot "deploy"
$ZipFile = Join-Path $ProjectRoot "password-generator-deploy.zip"

Write-Host "=== Password Generator Deployment Builder ===" -ForegroundColor Cyan
Write-Host ""

# Change to project root
Set-Location $ProjectRoot

# Step 1: Install dependencies
Write-Host "[1/6] Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) { throw "npm install failed" }

# Step 2: Run tests
Write-Host "[2/6] Running tests..." -ForegroundColor Yellow
npm test
if ($LASTEXITCODE -ne 0) { 
    Write-Host ""
    Write-Host "=== Build Failed ===" -ForegroundColor Red
    Write-Host "Tests did not pass. Fix the failing tests before deploying." -ForegroundColor Red
    exit 1
}
Write-Host "  All tests passed!" -ForegroundColor Green

# Step 3: Build Vue frontend
Write-Host "[3/6] Building Vue frontend..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) { throw "Vue build failed" }

# Step 4: Compile TypeScript server to JavaScript
Write-Host "[4/6] Compiling server.ts to JavaScript..." -ForegroundColor Yellow
npx tsc server.ts --module ESNext --moduleResolution bundler --esModuleInterop --outDir .
if ($LASTEXITCODE -ne 0) { throw "TypeScript compilation failed" }

# Step 5: Prepare deployment folder
Write-Host "[5/6] Preparing deployment folder..." -ForegroundColor Yellow

# Clean and create output directory
if (Test-Path $OutputDir) {
    Remove-Item $OutputDir -Recurse -Force
}
New-Item -ItemType Directory -Path $OutputDir | Out-Null

# Copy required files
Copy-Item -Path (Join-Path $ProjectRoot "dist") -Destination (Join-Path $OutputDir "dist") -Recurse
Copy-Item -Path (Join-Path $ProjectRoot "server.js") -Destination $OutputDir
Copy-Item -Path (Join-Path $ProjectRoot "package.json") -Destination $OutputDir

# Read config from package.json and create .env file
$packageJson = Get-Content (Join-Path $ProjectRoot "package.json") | ConvertFrom-Json
$port = $packageJson.config.port
$envContent = "PORT=$port"
Set-Content -Path (Join-Path $OutputDir ".env") -Value $envContent
Write-Host "  Generated .env with PORT=$port" -ForegroundColor Gray

# Create minimal package.json for production
$prodPackage = @{
    name = $packageJson.name
    version = $packageJson.version
    description = $packageJson.description
    type = "module"
    scripts = @{
        start = "node server.js"
    }
    dependencies = @{
        express = $packageJson.dependencies.express
        dotenv = $packageJson.dependencies.dotenv
    }
}
$prodPackage | ConvertTo-Json -Depth 10 | Set-Content (Join-Path $OutputDir "package.json")

# Step 6: Create ZIP file
Write-Host "[6/6] Creating ZIP archive..." -ForegroundColor Yellow

if (Test-Path $ZipFile) {
    Remove-Item $ZipFile -Force
}
Compress-Archive -Path (Join-Path $OutputDir "*") -DestinationPath $ZipFile

Write-Host ""
Write-Host "=== Build Complete ===" -ForegroundColor Green
Write-Host "Deployment ZIP: $ZipFile" -ForegroundColor Cyan
Write-Host ""
Write-Host "Contents:" -ForegroundColor White
Write-Host "  - dist/          (Vue frontend)" 
Write-Host "  - server.js      (Express server)"
Write-Host "  - package.json   (Production dependencies)"
Write-Host "  - .env           (PORT=6100)"
Write-Host ""
Write-Host "To deploy:" -ForegroundColor Yellow
Write-Host "  1. Extract ZIP to target folder"
Write-Host "  2. Run: npm install"
Write-Host "  3. Run: npm start"
Write-Host ""
