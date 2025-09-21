# PowerShell script to make all public repositories private
# Requires: PowerShell 5.1 or later
# Usage: .\make-repos-private.ps1 -Token "your-github-token"

param(
    [Parameter(Mandatory=$true)]
    [string]$Token,
    
    [string]$Username = "coltak88"
)

# GitHub API headers
$headers = @{
    "Authorization" = "token $Token"
    "Accept" = "application/vnd.github.v3+json"
    "User-Agent" = "PowerShell-GitHub-API"
}

function Get-PublicRepositories {
    param([string]$username)
    
    $repos = @()
    $page = 1
    
    do {
        $url = "https://api.github.com/users/$username/repos?page=$page&per_page=100"
        $response = Invoke-RestMethod -Uri $url -Headers $headers -Method Get
        
        if ($response.Count -eq 0) { break }
        
        $publicRepos = $response | Where-Object { $_.private -eq $false }
        $repos += $publicRepos
        $page++
    } while ($response.Count -eq 100)
    
    return $repos
}

function Set-RepositoryPrivate {
    param([string]$owner, [string]$repo)
    
    $url = "https://api.github.com/repos/$owner/$repo"
    $body = @{
        private = $true
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri $url -Headers $headers -Method Patch -Body $body
        Write-Host "✅ Made $owner/$repo private" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "❌ Failed to make $owner/$repo private: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

Write-Host "Fetching public repositories for $Username..." -ForegroundColor Cyan

$publicRepos = Get-PublicRepositories -username $Username

if ($publicRepos.Count -eq 0) {
    Write-Host "No public repositories found." -ForegroundColor Yellow
    exit 0
}

Write-Host "Found $($publicRepos.Count) public repositories:" -ForegroundColor Green
$publicRepos | ForEach-Object { Write-Host "  - $($_.full_name)" }

Write-Host "`nDo you want to make all these repositories private? (yes/no)" -ForegroundColor Yellow
$response = Read-Host

if ($response -ne "yes" -and $response -ne "y") {
    Write-Host "Operation cancelled." -ForegroundColor Yellow
    exit 0
}

Write-Host "`nMaking repositories private..." -ForegroundColor Cyan

$successCount = 0
foreach ($repo in $publicRepos) {
    if (Set-RepositoryPrivate -owner $Username -repo $repo.name) {
        $successCount++
    }
}

Write-Host "`n✅ Completed! Made $successCount out of $($publicRepos.Count) repositories private." -ForegroundColor Green