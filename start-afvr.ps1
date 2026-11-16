Start-Process powershell `
  -ArgumentList "-NoExit","-Command","npm run dev:web"

Start-Sleep -Seconds 5

Start-Process "http://localhost:5000"