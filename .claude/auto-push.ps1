# Auto-commit and push to GitHub after each Claude session
Set-Location "c:\Users\licaodecasa_nprata\Documents\LC(CRM)"

$changes = git status --porcelain
if (-not $changes) { exit 0 }

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm"
git add -A
git commit -m "Auto-save: $timestamp"
git push origin main 2>&1
