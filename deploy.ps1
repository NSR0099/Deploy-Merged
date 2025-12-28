Write-Host "🚀 Starting Deployment/Setup Script..." -ForegroundColor Green

# Check prerequisites
Write-Host "Checking prerequisites..."
if (!(Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Error "Node.js is not installed. Please install it first."
    exit 1
}
if (!(Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Error "Python is not installed. Please install it first."
    exit 1
}

# Install Root Dependencies
Write-Host "📦 Installing Node dependencies..." -ForegroundColor Cyan
npm install
if ($LASTEXITCODE -ne 0) { Write-Error "npm install failed"; exit 1 }

# Install Python Dependencies
Write-Host "🐍 Installing Python dependencies for AI Service..." -ForegroundColor Cyan
pip install -r apps/ai-services/requirements.txt
if ($LASTEXITCODE -ne 0) { 
    Write-Warning "pip install failed. Trying with 'python -m pip'..."
    python -m pip install -r apps/ai-services/requirements.txt
}

# Create .env for citizen backend if not exists (already done by agent, but good practice to have in script)
if (!(Test-Path "apps/citizen/backend/.env")) {
    Write-Host "Creating default .env for Citizen Backend..."
    Set-Content -Path "apps/citizen/backend/.env" -Value "PORT=5000`nMONGODB_URI=mongodb+srv://SmartEmergency:innovex123@cluster0.p7wpdve.mongodb.net/SmartEmergency?retryWrites=true&w=majority&appName=Cluster0`nJWT_SECRET=dev_secret_key_12345`nAI_SERVICE_URL=http://localhost:8080"
}

# Start the application
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host "▶️  Starting all services via 'npm run dev'..." -ForegroundColor Green
npm run dev
