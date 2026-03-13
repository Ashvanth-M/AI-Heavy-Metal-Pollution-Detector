$url = "http://localhost:5000/api/upload-csv"
$filePath = ".\chennai_samples_varied_risk.csv"

# Create the multipart form data
$boundary = [System.Guid]::NewGuid().ToString()
$LF = "`r`n"

$bodyLines = (
    "--$boundary",
    "Content-Disposition: form-data; name=`"file`"; filename=`"chennai_samples_varied_risk.csv`"",
    "Content-Type: text/csv$LF",
    (Get-Content $filePath -Raw),
    "--$boundary--$LF"
) -join $LF

try {
    $response = Invoke-RestMethod -Uri $url -Method Post -Body $bodyLines -ContentType "multipart/form-data; boundary=$boundary"
    Write-Host "Upload successful!"
    Write-Host "Response:" ($response | ConvertTo-Json -Depth 10)
} catch {
    Write-Host "Upload failed:" $_.Exception.Message
    Write-Host "Response:" $_.Exception.Response
}