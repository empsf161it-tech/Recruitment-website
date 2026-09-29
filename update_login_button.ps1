$files = Get-ChildItem -Path "d:\project 3\Recruitment\*.html"
$pattern = '(?s)<a href="login\.html" class="drawer-link">\s*<svg[^>]*>.*?</svg>\s*Login\s*</a>'
$replacement = '<div style="padding: var(--space-4);">
        <a href="login.html" class="btn btn-primary" style="width: 100%; justify-content: center; gap: var(--space-2);">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
          Login
        </a>
      </div>'

foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName)
    if ($content -match $pattern) {
        $newContent = [regex]::Replace($content, $pattern, $replacement)
        [System.IO.File]::WriteAllText($file.FullName, $newContent)
        Write-Host "Updated $($file.Name)"
    }
}
Write-Host "Done"
