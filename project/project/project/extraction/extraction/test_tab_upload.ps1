# Test tab-separated CSV upload script
$filePath = "C:\Users\ashva\Documents\pavi\pavi\extraction\extraction\test_tab_format.csv"
$uri = "http://localhost:3004/api/samples/upload"

# Read file content
$fileBytes = [System.IO.File]::ReadAllBytes($filePath)
$fileContent = [System.Text.Encoding]::UTF8.GetString($fileBytes)

# Create multipart form data
$boundary = [System.Guid]::NewGuid().ToString()
$LF = "`r`n"

$bodyLines = (
    "--$boundary",
    "Content-Disposition: form-data; name=`"file`"; filename=`"test_tab_format.csv`"",
    "Content-Type: text/csv$LF",
    $fileContent,
    "--$boundary--$LF"
) -join $LF

try {
    $response = Invoke-RestMethod -Uri $uri -Method Post -ContentType "multipart/form-data; boundary=$boundary" -Body $bodyLines
    Write-Host "Tab-separated CSV Upload successful:"
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "Tab-separated CSV Upload failed:"
    Write-Host $_.Exception.Message
}