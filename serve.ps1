# Local server for FRANK.DB: static files + a tiny visit-counter backend.
# No Node or Python needed.
#
# Usage:  powershell -ExecutionPolicy Bypass -File serve.ps1 [-Port 5173]
#
# Backend routes (localhost only):
#   POST /api/hit    records an anonymous visit/page view   (sent by js/track.js)
#   GET  /api/count  public totals shown on the site
#   GET  /api/stats  full numbers for stats.html
# Data lives in _data/visits.jsonl (one JSON event per line). No IP address is stored.
param([int]$Port = 5173)

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$dataDir = Join-Path $root "_data"
New-Item -ItemType Directory -Force $dataDir | Out-Null
$logFile = Join-Path $dataDir "visits.jsonl"
$utf8 = New-Object System.Text.UTF8Encoding($false)

$types = @{ ".html"="text/html; charset=utf-8"; ".css"="text/css"; ".js"="text/javascript"; ".json"="application/json";
            ".md"="text/markdown; charset=utf-8"; ".jpg"="image/jpeg"; ".jpeg"="image/jpeg"; ".png"="image/png";
            ".webp"="image/webp"; ".svg"="image/svg+xml"; ".pdf"="application/pdf"; ".ico"="image/x-icon" }

# ---- load existing events ----
$events = New-Object System.Collections.ArrayList
if (Test-Path $logFile) {
  foreach ($line in [IO.File]::ReadAllLines($logFile, $utf8)) {
    if ($line.Trim()) { try { [void]$events.Add(($line | ConvertFrom-Json)) } catch {} }
  }
}
Write-Host "Loaded $($events.Count) saved events from $logFile"

function Send-Json($res, $obj, [int]$code = 200) {
  $json = ConvertTo-Json -InputObject $obj -Depth 8 -Compress
  $bytes = $utf8.GetBytes($json)
  $res.StatusCode = $code
  $res.ContentType = "application/json; charset=utf-8"
  $res.Headers.Add("Cache-Control", "no-store")
  $res.ContentLength64 = $bytes.Length
  $res.OutputStream.Write($bytes, 0, $bytes.Length)
}

function Get-Counts {
  $v = @($events | Where-Object { $_.k -eq "visit" })
  $u = @($v | ForEach-Object { $_.v } | Select-Object -Unique)
  @{ visits = $v.Count; unique = $u.Count }
}

function Tally($items, $prop) {
  $h = [ordered]@{}
  foreach ($i in $items) {
    $key = [string]$i.$prop
    if (-not $key) { $key = "(direct)" }
    $h[$key] = 1 + [int]$h[$key]
  }
  $h
}

function Get-Stats {
  $now = (Get-Date).ToUniversalTime()
  $visits = @($events | Where-Object { $_.k -eq "visit" })
  $views = @($events | Where-Object { $_.k -eq "view" })
  $today = $now.ToString("yyyy-MM-dd")
  $todayVisits = @($visits | Where-Object { ([string]$_.t).StartsWith($today) })
  $days = @()
  for ($i = 13; $i -ge 0; $i--) {
    $d = $now.AddDays(-$i).ToString("yyyy-MM-dd")
    $days += @{
      date = $d
      visits = @($visits | Where-Object { ([string]$_.t).StartsWith($d) }).Count
      views = @($views | Where-Object { ([string]$_.t).StartsWith($d) }).Count
    }
  }
  $recent = @($events | Select-Object -Last 12 | ForEach-Object { @{ t = $_.t; k = $_.k; p = $_.p; l = $_.l; m = $_.m; w = $_.w } })
  [array]::Reverse($recent)
  @{
    totals = @{
      visits = $visits.Count
      uniqueVisitors = @($visits | ForEach-Object { $_.v } | Select-Object -Unique).Count
      pageViews = $views.Count
      todayVisits = $todayVisits.Count
      todayUnique = @($todayVisits | ForEach-Object { $_.v } | Select-Object -Unique).Count
    }
    days = $days
    pages = Tally $views "p"
    langs = Tally $visits "l"
    modes = Tally $visits "m"
    devices = Tally $visits "w"
    referrers = Tally $visits "ref"
    recent = $recent
    generated = $now.ToString("yyyy-MM-ddTHH:mm:ssZ")
  }
}

function Handle-Hit($req, $res) {
  if ($req.HttpMethod -ne "POST" -or $req.ContentLength64 -gt 2048 -or $req.ContentLength64 -le 0) { Send-Json $res @{ error = "bad request" } 400; return }
  $sr = New-Object IO.StreamReader($req.InputStream, [Text.Encoding]::UTF8)
  $body = $sr.ReadToEnd(); $sr.Close()
  $d = $body | ConvertFrom-Json
  # strict validation: only known shapes are stored
  if ($d.k -notin @("visit", "view")) { Send-Json $res @{ error = "k" } 400; return }
  if (([string]$d.v) -notmatch '^[a-f0-9]{16}$') { Send-Json $res @{ error = "v" } 400; return }
  if (([string]$d.p) -notmatch '^[a-z]{1,20}$') { Send-Json $res @{ error = "p" } 400; return }
  if ($d.l -notin @("en", "zh")) { Send-Json $res @{ error = "l" } 400; return }
  if ($d.m -notin @("simple", "sql")) { Send-Json $res @{ error = "m" } 400; return }
  if ($d.w -notin @("mobile", "desktop")) { Send-Json $res @{ error = "w" } 400; return }
  $ref = [string]$d.ref
  if ($ref -notmatch '^[A-Za-z0-9.-]{0,60}$') { $ref = "" }
  $ev = [pscustomobject]@{
    t = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
    k = [string]$d.k; v = [string]$d.v; p = [string]$d.p; l = [string]$d.l; m = [string]$d.m; w = [string]$d.w; ref = $ref
  }
  [void]$events.Add($ev)
  [IO.File]::AppendAllText($logFile, ((ConvertTo-Json -InputObject $ev -Compress) + "`n"), $utf8)
  Send-Json $res (Get-Counts)
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
Write-Host "Serving $root at http://localhost:$Port/   (stats: http://localhost:$Port/stats.html)"

# static files that must never be served
$blocked = @("_data", "serve.ps1", ".gitignore")

while ($listener.IsListening) {
  $ctx = $listener.GetContext()
  $req = $ctx.Request; $res = $ctx.Response
  try {
    $path = [Uri]::UnescapeDataString($req.Url.AbsolutePath)
    if ($path.StartsWith("/api/")) {
      if (-not [Net.IPAddress]::IsLoopback($req.RemoteEndPoint.Address)) { Send-Json $res @{ error = "local only" } 403 }
      elseif ($path -eq "/api/hit") { Handle-Hit $req $res }
      elseif ($path -eq "/api/count") { Send-Json $res (Get-Counts) }
      elseif ($path -eq "/api/stats") { Send-Json $res (Get-Stats) }
      else { Send-Json $res @{ error = "not found" } 404 }
    } else {
      $rel = $path.TrimStart("/")
      if ($rel -eq "") { $rel = "index.html" }
      $first = ($rel -split "/")[0]
      $file = [IO.Path]::GetFullPath((Join-Path $root $rel))
      if ($blocked -contains $first -or -not $file.StartsWith($root) -or -not (Test-Path $file -PathType Leaf)) {
        $res.StatusCode = 404
      } else {
        $bytes = [IO.File]::ReadAllBytes($file)
        $ext = [IO.Path]::GetExtension($file).ToLower()
        $res.ContentType = if ($types[$ext]) { $types[$ext] } else { "application/octet-stream" }
        $res.Headers.Add("Cache-Control", "no-cache")
        $res.ContentLength64 = $bytes.Length
        $res.OutputStream.Write($bytes, 0, $bytes.Length)
      }
    }
  } catch {
    try { $res.StatusCode = 500 } catch {}
  } finally {
    try { $res.Close() } catch {}
  }
}
