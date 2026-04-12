# Starts Spring Boot on http://localhost:8080 (requires MongoDB on 27017).
$ErrorActionPreference = "Stop"

if (-not $env:JAVA_HOME) {
    $props = java -XshowSettings:properties -version 2>&1 | Out-String
    if ($props -match 'java\.home = (.+)') {
        $env:JAVA_HOME = $Matches[1].Trim()
        Write-Host "JAVA_HOME was unset; using $env:JAVA_HOME"
    } else {
        Write-Error "Could not detect JAVA_HOME. Install a JDK and set JAVA_HOME manually."
    }
}

Set-Location $PSScriptRoot\backend
& .\mvnw.cmd @args
