# Builds the public resume PDFs (no phone number) from tools/resume/*.html using headless Chrome.
# Usage:  powershell -ExecutionPolicy Bypass -File tools/build-resume.ps1
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$chrome = @("C:\Program Files\Google\Chrome\Application\chrome.exe", "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe") | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $chrome) { throw "Chrome or Edge not found" }
$outDir = Join-Path $root "assets\resume-public"
New-Item -ItemType Directory -Force $outDir | Out-Null
$jobs = @(
  @{ src = "tools\resume\resume-en.html"; out = "Tzuyang_Lin_Resume.pdf" },
  @{ src = "tools\resume\resume-zh.html"; out = "Tzuyang_Lin_Resume_zh.pdf" }
)
foreach ($j in $jobs) {
  $src = (Resolve-Path (Join-Path $root $j.src)).Path
  $out = Join-Path $outDir $j.out
  & $chrome --headless=new --disable-gpu --no-pdf-header-footer --print-to-pdf="$out" "file:///$($src -replace '\\','/')" | Out-Null
  Start-Sleep -Milliseconds 800
  "{0}  {1:N0} bytes" -f $out, (Get-Item $out).Length
}

# Render a PNG preview of page 1 of each PDF (Windows PDF renderer), used by the on-site viewer.
Add-Type -AssemblyName System.Runtime.WindowsRuntime
$null = [Windows.Data.Pdf.PdfDocument, Windows.Data.Pdf, ContentType=WindowsRuntime]
$null = [Windows.Storage.StorageFile, Windows.Storage, ContentType=WindowsRuntime]
$null = [Windows.Storage.Streams.InMemoryRandomAccessStream, Windows.Storage.Streams, ContentType=WindowsRuntime]
$ext = [System.WindowsRuntimeSystemExtensions].GetMethods()
$asOp = ($ext | Where-Object { $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1' })[0]
$asAct = ($ext | Where-Object { $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncAction' })[0]
function Await($op, $type) { $t = $asOp.MakeGenericMethod($type).Invoke($null, @($op)); $t.Wait(-1) | Out-Null; $t.Result }
foreach ($j in $jobs) {
  $pdf = Join-Path $outDir $j.out
  $f = Await ([Windows.Storage.StorageFile]::GetFileFromPathAsync($pdf)) ([Windows.Storage.StorageFile])
  $d = Await ([Windows.Data.Pdf.PdfDocument]::LoadFromFileAsync($f)) ([Windows.Data.Pdf.PdfDocument])
  $pg = $d.GetPage(0)
  $ms = New-Object Windows.Storage.Streams.InMemoryRandomAccessStream
  $opt = New-Object Windows.Data.Pdf.PdfPageRenderOptions; $opt.DestinationWidth = 1500
  $t = $asAct.Invoke($null, @($pg.RenderToStreamAsync($ms, $opt))); $t.Wait(-1) | Out-Null
  $null = $ms.Seek(0)
  $s = [System.IO.WindowsRuntimeStreamExtensions]::AsStreamForRead($ms)
  $png = [IO.Path]::ChangeExtension($pdf, ".png")
  $fs = [IO.File]::Create($png); $s.CopyTo($fs); $fs.Close()
  # flatten onto white, scale to 1700px wide and save as a light JPEG for the web viewer
  Add-Type -AssemblyName System.Drawing
  $src = [System.Drawing.Image]::FromFile($png)
  $w = 1700; $h = [int]($src.Height * $w / $src.Width)
  $bmp = New-Object System.Drawing.Bitmap $w, $h
  $g = [System.Drawing.Graphics]::FromImage($bmp); $g.Clear([System.Drawing.Color]::White)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.DrawImage($src, 0, 0, $w, $h); $g.Dispose(); $src.Dispose()
  $jpg = [IO.Path]::ChangeExtension($pdf, ".jpg")
  $enc = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
  $ep = New-Object System.Drawing.Imaging.EncoderParameters 1
  $ep.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), 88L
  $bmp.Save($jpg, $enc, $ep); $bmp.Dispose()
  Remove-Item $png
  "{0}  {1:N0} bytes  ({2} page(s) in pdf)" -f $jpg, (Get-Item $jpg).Length, $d.PageCount
}
