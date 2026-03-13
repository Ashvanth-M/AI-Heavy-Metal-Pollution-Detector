# Test minimal CSV format with quoted values
$url = "http://localhost:3002/api/samples/upload"
$filePath = "test_minimal.csv"

if (Test-Path $filePath) {
    Write-Host "Testing minimal CSV format with quotes..." -ForegroundColor Green
    
    # Use curl for file upload
    $response = curl -X POST -F "file=@$filePath" $url
    
    Write-Host "Response:" -ForegroundColor Yellow
    Write-Host $response
} else {
    Write-Host "File not found: $filePath" -ForegroundColor Red
}