# 为所有 API 路由添加 dynamic = 'force-dynamic'
Get-ChildItem -Path "src/app/api" -Filter "route.ts" -Recurse | ForEach-Object {
    $filePath = $_.FullName
    $content = [System.IO.File]::ReadAllText($filePath)
    
    if (-not ($content -match "export const dynamic")) {
        $content = "export const dynamic = 'force-dynamic';`n`n" + $content
        [System.IO.File]::WriteAllText($filePath, $content)
        Write-Host "Fixed: $filePath"
    }
}
