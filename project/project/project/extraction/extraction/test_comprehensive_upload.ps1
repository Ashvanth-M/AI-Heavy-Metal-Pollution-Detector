# Test comprehensive semicolon-separated CSV
$url = "http://localhost:3002/api/samples/upload"
$filePath = "test_comprehensive.csv"

if (Test-Path $filePath) {
    Write-Host "Testing comprehensive CSV format with semicolons..." -ForegroundColor Green
    
    # Use curl for file upload
    $response = curl -X POST -F "file=@$filePath" $url
    
    Write-Host "Response:" -ForegroundColor Yellow
    Write-Host $response
} else {
    Write-Host "File not found: $filePath" -ForegroundColor Red
}