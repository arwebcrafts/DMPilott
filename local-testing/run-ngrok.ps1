$pinfo = New-Object System.Diagnostics.ProcessStartInfo
$pinfo.FileName = "C:\Users\PMYLS\AppData\Roaming\npm\node_modules\ngrok\bin\ngrok.exe"
$pinfo.Arguments = "http 3000"
$pinfo.RedirectStandardOutput = $true
$pinfo.RedirectStandardError = $true
$pinfo.UseShellExecute = $false
$p = New-Object System.Diagnostics.Process
$p.StartInfo = $pinfo
$p.Start() | Out-Null
Start-Sleep 5
$stdout = $p.StandardOutput.ReadToEnd()
$stderr = $p.StandardError.ReadToEnd()
Write-Host "STDOUT:"
Write-Host $stdout
Write-Host "STDERR:"
Write-Host $stderr
$p.Kill()
