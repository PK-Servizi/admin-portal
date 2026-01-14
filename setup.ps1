# PK Servizi Frontend - Installation & Setup Script
# This script guides you through setting up the React frontend

Write-Host "================================" -ForegroundColor Cyan
Write-Host "PK Servizi Frontend Setup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js 18+ from https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check npm version
Write-Host "Checking npm installation..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "✓ npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ npm is not installed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Step 1: Installing Dependencies" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to frontend directory
$frontendPath = "d:\work\pk_services\PK SERVIZI\frontend"
Set-Location $frontendPath

Write-Host "Installing npm packages..." -ForegroundColor Yellow
Write-Host "This may take a few minutes..." -ForegroundColor Gray
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Dependencies installed successfully!" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to install dependencies!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Step 2: Environment Configuration" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
if (Test-Path ".env") {
    Write-Host "✓ .env file already exists" -ForegroundColor Green
    $overwrite = Read-Host "Do you want to overwrite it? (y/n)"
    if ($overwrite -ne "y") {
        Write-Host "Keeping existing .env file" -ForegroundColor Yellow
    } else {
        Copy-Item ".env.example" ".env" -Force
        Write-Host "✓ .env file created from .env.example" -ForegroundColor Green
    }
} else {
    Copy-Item ".env.example" ".env"
    Write-Host "✓ .env file created from .env.example" -ForegroundColor Green
}

Write-Host ""
Write-Host "Please configure your .env file:" -ForegroundColor Yellow
Write-Host "  VITE_API_BASE_URL=http://localhost:3001" -ForegroundColor Gray
Write-Host "  VITE_APP_NAME=PK Servizi" -ForegroundColor Gray
Write-Host ""

$editEnv = Read-Host "Do you want to edit .env now? (y/n)"
if ($editEnv -eq "y") {
    notepad .env
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Step 3: Verify Backend Connection" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

$backendUrl = "http://localhost:3001"
Write-Host "Checking backend at $backendUrl/health..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "$backendUrl/health" -Method Get -TimeoutSec 5
    Write-Host "✓ Backend is running!" -ForegroundColor Green
    Write-Host "  Status: $($response.status)" -ForegroundColor Gray
    Write-Host "  Service: $($response.service)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Backend is not running!" -ForegroundColor Red
    Write-Host "Please start the NestJS backend first:" -ForegroundColor Yellow
    Write-Host "  cd ../PK SERVIZI" -ForegroundColor Gray
    Write-Host "  npm run start:dev" -ForegroundColor Gray
    Write-Host ""
    $continue = Read-Host "Continue anyway? (y/n)"
    if ($continue -ne "y") {
        exit 1
    }
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✓ All dependencies installed" -ForegroundColor Green
Write-Host "✓ Environment configured" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Start the development server:" -ForegroundColor White
Write-Host "     npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "  2. Open in browser:" -ForegroundColor White
Write-Host "     http://localhost:3000" -ForegroundColor Gray
Write-Host ""
Write-Host "  3. Read the documentation:" -ForegroundColor White
Write-Host "     - README.md (feature overview)" -ForegroundColor Gray
Write-Host "     - ARCHITECTURE.md (technical details)" -ForegroundColor Gray
Write-Host "     - QUICKSTART.md (quick start guide)" -ForegroundColor Gray
Write-Host ""
Write-Host "Happy coding! 🚀" -ForegroundColor Cyan
Write-Host ""

$startNow = Read-Host "Start development server now? (y/n)"
if ($startNow -eq "y") {
    Write-Host ""
    Write-Host "Starting development server..." -ForegroundColor Yellow
    Write-Host "Press Ctrl+C to stop" -ForegroundColor Gray
    Write-Host ""
    npm run dev
}
