Add-Type -AssemblyName System.Drawing
foreach ($s in @(192, 512)) {
    $bmp = New-Object System.Drawing.Bitmap $s, $s
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $p1 = New-Object System.Drawing.Point 0, 0
    $p2 = New-Object System.Drawing.Point $s, $s
    $c1 = [System.Drawing.Color]::FromArgb(255, 124, 58, 237)
    $c2 = [System.Drawing.Color]::FromArgb(255, 236, 72, 153)
    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush $p1, $p2, $c1, $c2
    $g.FillEllipse($brush, 0, 0, $s, $s)
    
    $fontSize = [float]($s * 0.3)
    $font = New-Object System.Drawing.Font ([string]'Arial'), ([float]$fontSize), ([System.Drawing.FontStyle]::Bold)
    $sf = New-Object System.Drawing.StringFormat
    $sf.Alignment = [System.Drawing.StringAlignment]::Center
    $sf.LineAlignment = [System.Drawing.StringAlignment]::Center
    $rect = New-Object System.Drawing.RectangleF 0, 0, $s, $s
    $g.DrawString('EF', $font, [System.Drawing.Brushes]::White, $rect, $sf)
    
    $bmp.Save("assets/icon-$s.png", [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    Write-Host "Generated assets/icon-$s.png"
}
