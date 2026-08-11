$ErrorActionPreference = "Stop"

function Get-ResponseWithoutRedirect([uri]$Uri) {
  $handler = [System.Net.Http.HttpClientHandler]::new()
  $handler.AllowAutoRedirect = $false
  $client = [System.Net.Http.HttpClient]::new($handler)
  $client.Timeout = [TimeSpan]::FromSeconds(15)
  try {
    $request = [System.Net.Http.HttpRequestMessage]::new(
      [System.Net.Http.HttpMethod]::Head,
      $Uri
    )
    return $client.SendAsync($request).GetAwaiter().GetResult()
  }
  finally {
    if ($request) { $request.Dispose() }
    $client.Dispose()
    $handler.Dispose()
  }
}

function Resolve-RedirectChain([string]$Url, [int]$MaxHops = 5) {
  $current = [uri]$Url
  $visited = [System.Collections.Generic.HashSet[string]]::new(
    [System.StringComparer]::OrdinalIgnoreCase
  )

  for ($hop = 0; $hop -le $MaxHops; $hop++) {
    $normalized = $current.AbsoluteUri
    if (-not $visited.Add($normalized)) {
      throw "Redirect loop detected at $normalized"
    }

    $response = Get-ResponseWithoutRedirect $current
    try {
      $status = [int]$response.StatusCode
      if ($status -lt 300 -or $status -ge 400) {
        return @{
          Url = $normalized
          StatusCode = $status
          Redirects = $hop
        }
      }

      if (-not $response.Headers.Location) {
        throw "Redirect response $status from $normalized has no Location header"
      }

      $next = [uri]::new($current, $response.Headers.Location)
      if ($next.AbsoluteUri -eq $normalized) {
        throw "Self redirect detected: $normalized -> $($next.AbsoluteUri)"
      }
      $current = $next
    }
    finally {
      $response.Dispose()
    }
  }

  throw "More than $MaxHops redirects starting at $Url"
}

function Assert-Final2xx([string]$Url, [int]$MaxRedirects = 1) {
  $result = Resolve-RedirectChain $Url
  if ($result.Redirects -gt $MaxRedirects) {
    throw "$Url used $($result.Redirects) redirects; maximum allowed is $MaxRedirects"
  }
  if ($result.StatusCode -lt 200 -or $result.StatusCode -ge 300) {
    throw "$Url ended at $($result.Url) with HTTP $($result.StatusCode)"
  }
  Write-Host "OK $Url -> $($result.Url) [$($result.StatusCode), redirects=$($result.Redirects)]"
}

$hosts = @("gats.vn", "api.gats.vn", "admin.gats.vn")
foreach ($hostname in $hosts) {
  $dns = Resolve-DnsName -Type A $hostname | Where-Object Type -eq "A"
  if (-not $dns) { throw "Missing A record for $hostname" }
}

# Public HTTP may redirect once to HTTPS. Public HTTPS must never redirect to
# itself or bounce between hosts/schemes.
Assert-Final2xx "http://gats.vn/" 1
Assert-Final2xx "https://gats.vn/" 0
Assert-Final2xx "https://gats.vn/api/courses?status=published&page=1&limit=1" 0
Assert-Final2xx "https://api.gats.vn/health/ready" 0
Assert-Final2xx "https://admin.gats.vn/" 1

$ready = Invoke-RestMethod -Uri "https://api.gats.vn/health/ready" -MaximumRedirection 0
if ($ready.status -ne "ready") { throw "API readiness check failed" }

$cors = Invoke-WebRequest `
  -Uri "https://api.gats.vn/health/live" `
  -Headers @{ Origin = "https://untrusted.example" } `
  -MaximumRedirection 0
if ($cors.Headers["Access-Control-Allow-Origin"]) {
  throw "Untrusted CORS origin was reflected"
}

Write-Host "Production DNS, redirect safety, HTTPS, readiness and CORS checks passed."
