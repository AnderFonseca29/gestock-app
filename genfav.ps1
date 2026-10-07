Add-Type -AssemblyName System.Drawing
$bmp = New-Object System.Drawing.Bitmap(64,64)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = 'AntiAlias'
$bg = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(37,99,235))
$g.FillRectangle($bg, 0,0,64,64)
$white = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
$trans = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255,255,255))
# cajas apiladas
$g.FillRectangle($trans, 14,14,16,16)
$g.FillRectangle($white, 24,14,26,16)
$g.FillRectangle($white, 14,24,36,16)
$g.FillRectangle($white, 14,40,36,14)
$g.Dispose()
$bmp.Save('C:\Users\Aprendiz Tarde\Documents\GESTOCK_CLIENTE\frontend_gestock\src\assets\favicon.png',[System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
Write-Output 'FAVICON CREADO'
