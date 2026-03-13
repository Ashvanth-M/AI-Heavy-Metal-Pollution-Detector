try {
    Write-Host "Testing dataset history API endpoint..."
    
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/history" -Method GET -ContentType "application/json"
    
    Write-Host "Success! Response:"
    Write-Host ($response | ConvertTo-Json -Depth 10)
    
} catch {
    Write-Host "Error testing history API:"
    Write-Host $_.Exception.Message
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseText = $reader.ReadToEnd()
        Write-Host "Response body: $responseText"
    }
}