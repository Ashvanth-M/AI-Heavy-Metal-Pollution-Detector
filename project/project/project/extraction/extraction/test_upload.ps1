# Test CSV upload script
$filePath = "C:\Users\ashva\Documents\pavi\pavi\extraction\extraction\test_pollution_data.csv"
$uri = "http://localhost:3004/api/samples/upload"

# Read file content
$fileBytes = [System.IO.File]::ReadAllBytes($filePath)
$fileContent = [System.Text.Encoding]::UTF8.GetString($fileBytes)

# Create multipart form data
$boundary = [System.Guid]::NewGuid().ToString()
$LF = "`r`n"

$bodyLines = (
    "--$boundary",
    "Content-Disposition: form-data; name=`"file`"; filename=`"test_pollution_data.csv`"",
    "Content-Type: text/csv$LF",
    $fileContent,
    "--$boundary--$LF"
) -join $LF

try {
    $response = Invoke-RestMethod -Uri $uri -Method Post -ContentType "multipart/form-data; boundary=$boundary" -Body $bodyLines
    Write-Host "Upload successful:"
    $response | ConvertTo-Json -Depth 5
} catch {
    Write-Host "Upload failed:"
    Write-Host $_.Exception.Message
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $errorResponse = $reader.ReadToEnd()
        Write-Host "Error response: $errorResponse"
    }
}