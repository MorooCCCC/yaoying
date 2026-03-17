# Yao Vision Project - GitHub Deployment Helper
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Yao Vision - GitHub Deployment Helper" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Git is installed
Write-Host "[Step 1] Checking Git..." -ForegroundColor Yellow
try {
    $gitVersion = git --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "OK Git installed: $gitVersion" -ForegroundColor Green
    } else {
        Write-Host "ERROR Git not installed, please install Git first" -ForegroundColor Red
        Write-Host "  Download: https://git-scm.com/download/win" -ForegroundColor Cyan
        exit 1
    }
} catch {
    Write-Host "ERROR Git not installed, please install Git first" -ForegroundColor Red
    Write-Host "  Download: https://git-scm.com/download/win" -ForegroundColor Cyan
    exit 1
}

Write-Host ""

# Switch to project directory
$projectPath = "d:\clawprj\yao-vision"
Set-Location $projectPath
Write-Host "[Step 2] Enter project directory: $projectPath" -ForegroundColor Yellow
Write-Host ""

# Initialize Git repository
Write-Host "[Step 3] Initialize Git repository..." -ForegroundColor Yellow
if (Test-Path ".git") {
    Write-Host "OK Git repository already exists" -ForegroundColor Green
} else {
    git init
    Write-Host "OK Git repository initialized" -ForegroundColor Green
}
Write-Host ""

# Create .gitignore
Write-Host "[Step 4] Create .gitignore..." -ForegroundColor Yellow
$gitignoreContent = @"
# Dependencies
node_modules/
.pnp/

# Next.js
.next/
out/
dist/

# Build outputs
.turbo/
build/

# Environment variables (contains API Key, do not commit)
.env
.env.local
.env.production

# Debug logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# System files
.DS_Store
Thumbs.db

# Vercel
.vercel/
"@

Set-Content -Path ".gitignore" -Value $gitignoreContent -Encoding UTF8
Write-Host "OK .gitignore created" -ForegroundColor Green
Write-Host ""

# Check Git user configuration
Write-Host "[Step 5] Check Git user configuration..." -ForegroundColor Yellow
$gitName = git config --get user.name
$gitEmail = git config --get user.email

if ([string]::IsNullOrWhiteSpace($gitName) -or [string]::IsNullOrWhiteSpace($gitEmail)) {
    Write-Host "Git user info not configured, please enter:" -ForegroundColor Yellow
    $userName = Read-Host "  Your GitHub username"
    $userEmail = Read-Host "  Your GitHub email"

    git config --global user.name $userName
    git config --global user.email $userEmail
    Write-Host "OK Git user info configured" -ForegroundColor Green
} else {
    Write-Host "OK Git user info already configured:" -ForegroundColor Green
    Write-Host "  Username: $gitName" -ForegroundColor Gray
    Write-Host "  Email: $gitEmail" -ForegroundColor Gray
}
Write-Host ""

# Create initial commit
Write-Host "[Step 6] Create initial commit..." -ForegroundColor Yellow
git add .
git commit -m "Initial commit: Yao Vision - AI I Ching Divination App"
Write-Host "OK Initial commit created" -ForegroundColor Green
Write-Host ""

# Next step guidance
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "[Next Step] Push to GitHub" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Open https://github.com/new" -ForegroundColor Yellow
Write-Host "2. Create a new repository, name: yao-vision" -ForegroundColor Yellow
Write-Host "3. Click 'Create repository'" -ForegroundColor Yellow
Write-Host "4. Copy repository URL (e.g.: https://github.com/your-username/yao-vision.git)" -ForegroundColor Yellow
Write-Host "5. Paste the URL below" -ForegroundColor Yellow
Write-Host ""

$repoUrl = Read-Host "Please paste your GitHub repository URL"

if ([string]::IsNullOrWhiteSpace($repoUrl)) {
    Write-Host "ERROR Repository URL cannot be empty" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[Step 7] Pushing to GitHub..." -ForegroundColor Yellow
git branch -M main
git remote add origin $repoUrl
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "SUCCESS Code pushed to GitHub!" -ForegroundColor Green
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "[Done] Deploy to Vercel" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. Open https://vercel.com" -ForegroundColor Yellow
    Write-Host "2. Login with GitHub account" -ForegroundColor Yellow
    Write-Host "3. Click 'Add New' -> 'Project'" -ForegroundColor Yellow
    Write-Host "4. Select 'yao-vision' repository" -ForegroundColor Yellow
    Write-Host "5. Click 'Deploy'" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "SUCCESS After deployment, visit https://yao-vision.vercel.app" -ForegroundColor Green
    Write-Host "SUCCESS Your friends can access via this link!" -ForegroundColor Green
} else {
    Write-Host "ERROR Push failed, please check:" -ForegroundColor Red
    Write-Host "  1. Repository URL is correct" -ForegroundColor Yellow
    Write-Host "  2. GitHub login status" -ForegroundColor Yellow
    Write-Host "  3. Network connection" -ForegroundColor Yellow
}

Write-Host ""
