$ErrorActionPreference = "Stop"

$hosts = @("gats.vn", "api.gats.vn", "admin.gats.vn")
foreach ($hostname in $hosts) {
  $dns = Resolve-DnsName -Type A $hostname | Where-Object Type -eq "A"
  if (-not $dns) { throw "Missing A record for $hostname" }
  $response = Invoke-WebRequest -Uri "https://$hostname/" -Method Head
  if ($response.StatusCode -lt 200 -or $response.StatusCode -ge 400) {
    throw "HTTPS check failed for $hostname ($($response.StatusCode))"
  }
}

$ready = Invoke-RestMethod -Uri "https://api.gats.vn/health/ready"
if ($ready.status -ne "ready") { throw "API readiness check failed" }

$cors = Invoke-WebRequest `
  -Uri "https://api.gats.vn/health/live" `
  -Headers @{ Origin = "https://untrusted.example" }
if ($cors.Headers["Access-Control-Allow-Origin"]) {
  throw "Untrusted CORS origin was reflected"
}

Write-Host "Production DNS, HTTPS, readiness and CORS checks passed."
