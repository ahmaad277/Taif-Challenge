# Decode all HEIC/HEIF files in assets/spot to PNG using the Windows WIC codec (WPF).
# Output goes to assets/spot/_decoded/<originalname>.png so the node pipeline can read them.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName PresentationCore

$spotDir = Join-Path $PSScriptRoot '..\assets\spot'
$spotDir = (Resolve-Path $spotDir).Path
$outDir  = Join-Path $spotDir '_decoded'
if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir | Out-Null }

$maxLong = 1600
$files = Get-ChildItem -Path $spotDir -File | Where-Object { $_.Extension -match '(?i)\.heic$|\.heif$' }

foreach ($f in $files) {
  $out = Join-Path $outDir ($f.BaseName + '.png')
  try {
    $stream = [System.IO.File]::OpenRead($f.FullName)
    $dec = [System.Windows.Media.Imaging.BitmapDecoder]::Create(
      $stream,
      [System.Windows.Media.Imaging.BitmapCreateOptions]::PreservePixelFormat,
      [System.Windows.Media.Imaging.BitmapCacheOption]::OnLoad)
    $frame = $dec.Frames[0]
    $src = [System.Windows.Media.Imaging.BitmapSource]$frame
    $long = [Math]::Max($frame.PixelWidth, $frame.PixelHeight)
    if ($long -gt $maxLong) {
      $scale = $maxLong / $long
      $st = New-Object System.Windows.Media.ScaleTransform($scale, $scale)
      $src = New-Object System.Windows.Media.Imaging.TransformedBitmap($frame, $st)
    }
    $enc = New-Object System.Windows.Media.Imaging.PngBitmapEncoder
    $enc.Frames.Add([System.Windows.Media.Imaging.BitmapFrame]::Create($src))
    $fs = [System.IO.File]::Create($out)
    $enc.Save($fs)
    $fs.Close(); $stream.Close()
    Write-Output ("OK   {0} -> {1}  ({2}x{3})" -f $f.Name, ($f.BaseName + '.png'), $frame.PixelWidth, $frame.PixelHeight)
  } catch {
    Write-Output ("FAIL {0}: {1}" -f $f.Name, $_.Exception.Message)
  }
}
Write-Output 'DONE'
