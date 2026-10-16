# Refreshes data/github.json with your public GitHub contribution calendar and repo dates.
# Run it whenever you want the heatmap and project timeline to catch up:
#   powershell -ExecutionPolicy Bypass -File update-github.ps1
# Reads only public GitHub pages/API. No login or token needed.
param([string]$User = "Zzyang0", [int]$FromYear = 2020)

$ProgressPreference = "SilentlyContinue"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$hdr = @{ "User-Agent" = "Mozilla/5.0" }
$result = [ordered]@{ user = $User; updated = (Get-Date).ToUniversalTime().ToString("yyyy-MM-dd"); years = [ordered]@{}; repos = @() }

for ($y = $FromYear; $y -le (Get-Date).Year; $y++) {
  $r = Invoke-WebRequest -UseBasicParsing -Uri "https://github.com/users/$User/contributions?from=$y-01-01&to=$y-12-31" -Headers $hdr
  $html = $r.Content
  # tooltip text by cell id: "12 contributions on April 30th." / "No contributions on ..."
  $counts = @{}
  foreach ($m in [regex]::Matches($html, '<tool-tip[^>]*for="([^"]+)"[^>]*>([^<]*)</tool-tip>')) {
    $n = 0
    if ($m.Groups[2].Value -match '^(\d+) contribution') { $n = [int]$Matches[1] }
    $counts[$m.Groups[1].Value] = $n
  }
  $byDate = @{}
  foreach ($c in [regex]::Matches($html, '<td[^>]*data-date="[^"]+"[^>]*>')) {
    $tag = $c.Value
    $date = [regex]::Match($tag, 'data-date="([^"]+)"').Groups[1].Value
    $level = [int][regex]::Match($tag, 'data-level="(\d)"').Groups[1].Value
    $id = [regex]::Match($tag, ' id="([^"]+)"').Groups[1].Value
    $byDate[$date] = @([int]$counts[$id], $level)
  }
  # the calendar HTML lists one weekday row at a time, so put the days back in date order
  $days = @()
  foreach ($d in ($byDate.Keys | Sort-Object)) { $days += , @($d, $byDate[$d][0], $byDate[$d][1]) }
  $total = ($days | ForEach-Object { $_[1] } | Measure-Object -Sum).Sum
  $result.years["$y"] = [ordered]@{ total = [int]$total; days = $days }
  Write-Host "$y : $total contributions, $($days.Count) days"
}

$repos = Invoke-RestMethod -Uri "https://api.github.com/users/$User/repos?per_page=100&type=owner" -Headers $hdr
$result.repos = @($repos | ForEach-Object { [ordered]@{ name = $_.name; created = $_.created_at.Substring(0, 10); pushed = $_.pushed_at.Substring(0, 10); fork = [bool]$_.fork; language = $_.language } })
Write-Host "$($result.repos.Count) repos"

$dir = Join-Path $root "data"
New-Item -ItemType Directory -Force $dir | Out-Null
$json = ConvertTo-Json -InputObject $result -Depth 6 -Compress
[IO.File]::WriteAllText((Join-Path $dir "github.json"), $json, (New-Object System.Text.UTF8Encoding($false)))
Write-Host "Saved data/github.json"
