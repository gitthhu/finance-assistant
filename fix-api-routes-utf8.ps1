# 为所有 API 路由添加 dynamic = 'force-dynamic' (UTF-8 编码)
# 兼容旧版 PowerShell

Get-ChildItem -Path "src/app/api" -Filter "route.ts" -Recurse | ForEach-Object {
    $filePath = $_.FullName
    
    # 使用 .NET 方法读取，指定 UTF-8 编码
    $content = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)
    
    if (-not ($content -match "export const dynamic")) {
        $newContent = "export const dynamic = 'force-dynamic';`n`n" + $content
        # 使用 .NET 方法写入，指定 UTF-8 编码
        [System.IO.File]::WriteAllText($filePath, $newContent, [System.Text.Encoding]::UTF8)
        Write-Host "Fixed: $filePath"
    }
}
