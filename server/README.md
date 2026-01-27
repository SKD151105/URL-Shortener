JWT is great for user-facing apps. For a backend-only service with trusted clients, API keys are more appropriate.

## Redis (Local Setup)

Redis is used by this project for caching/rate limiting. Follow the steps below to install and start Redis locally on Windows (Memurai) or via WSL.

### Option A: Windows (Memurai)

1. Install Memurai (Redis-compatible for Windows) from https://www.memurai.com.
2. Start the Memurai service:
	```powershell
	Get-Service *memurai*
	Start-Service memurai
	```
3. Verify Redis is running:
	```powershell
	"C:\Program Files\Memurai\memurai-cli.exe" ping
	```
	You should see `PONG`.

### Option B: WSL (Ubuntu)

1. Install Redis:
	```bash
	sudo apt update
	sudo apt install -y redis-server
	```
2. Start Redis:
	```bash
	sudo service redis-server start
	```
3. Verify Redis is running:
	```bash
	redis-cli ping
	```
	You should see `PONG`.

### Stopping Redis

- Memurai (Windows service):
	```powershell
	Stop-Service memurai
	```
- WSL:
	```bash
	sudo service redis-server stop
	```

### Environment Variable

Make sure your `.env` points to your local Redis instance:

```env
REDIS_URL=redis://localhost:6379
```
