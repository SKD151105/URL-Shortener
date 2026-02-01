# URL-Shortener API

Backend API for short links with redirects, analytics, caching, and rate limiting. This README focuses on architecture and local setup.

## Architecture (simple)

```
Client
  │
  ▼
API (Express)
  │  ├─ Config (env, db, redis)
  │  ├─ Validation (Zod schemas + validate middleware)
  │  ├─ Middlewares (CORS, Helmet, HPP, Rate Limit, Logger, Error Handler)
  │  ├─ Routes (link, redirect, analytics)
  │  ├─ Controllers (thin)
  │  ├─ Services (business logic)
  │  └─ Repositories (DB queries)
  │  └─ Utils (errors, logger, helpers)
  │
  ├─ MongoDB (Links, Users, Clicks)
  └─ Redis (cache + rate limiting)
```

## Auth Method

API key authentication via header:

```
x-api-key: <your_api_key>
```

API keys are stored on the `User` model. Create a user with a unique `apiKey` in the database or add your own user creation endpoint.

## Request Validation

All endpoints use schema-based validation (Zod). Invalid requests return a 400 with validation details.

## Cache Strategy

Redis caches each short code with a JSON payload:

```
{ "url": "<originalUrl>", "linkId": "<linkObjectId>" }
```

TTL: 1 hour. Cache is used for fast redirects and to reduce DB reads. Rate limiting also uses Redis.

**Negative caching:** missing short codes are cached with a short TTL (1 minute) to avoid repeated DB hits for invalid links.

## Rate Limits

- Create link: 10 requests per 60 seconds per user.
- Redirect: 100 requests per 60 seconds per IP.

## API List

- `GET /api/v1/health` — health check
- `POST /api/v1/links` — create short link (auth required) and returns `shortUrl`
- `GET /api/v1/redirect/:code` — redirect to original URL
- `GET /api/v1/analytics/:shortCode` — total clicks for a short code (auth required)

### Create Link Response

Response includes the created link fields plus a `shortUrl`:

```
{
  "statusCode": 201,
  "data": {
    "_id": "...",
    "originalUrl": "https://example.com",
    "shortCode": "abc123",
    "userId": "...",
    "shortUrl": "http://localhost:3000/api/v1/redirect/abc123"
  },
  "message": "Link created",
  "success": true
}
```

## Error Handling

Centralized error handling is implemented as middleware and returns a consistent JSON shape with `requestId`. This keeps API responses predictable and simplifies debugging.

## How to Run Locally

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment
### 2.5) Create a user (required for API access)

Run the user creation script:

```bash
node scripts/createUser.js <name>
```

This will generate a user with a secure API key. Copy the API key for use in requests.

Create a `.env` file in the `server` directory:

```env
MONGODB_URI="mongodb+srv://<username>:<password>@<cluster-url>/<db-name>"
PORT=3000
REDIS_URL="redis://localhost:6379"
LOG_LEVEL=info
```

### 3) Start Redis locally

**Option A: Windows (Memurai)**

1. Install Memurai from [memurai.com](https://www.memurai.com).
2. Start the Memurai service:

```powershell
Get-Service *memurai*
Start-Service memurai
```

3. Verify Redis is running:

```powershell
& "C:\Program Files\Memurai\memurai-cli.exe" ping
```

You should see `PONG`.

**Option B: WSL (Ubuntu)**

```bash
sudo apt update
sudo apt install -y redis-server
sudo service redis-server start
redis-cli ping
```

### 4) Run the server

```bash
npm run dev
```

## Stopping Redis

- Memurai:

```powershell
Stop-Service memurai
```

- WSL:

```bash
sudo service redis-server stop
```

## Why these choices

**API keys** for trusted clients keeps auth simple and fast for backend-only use.  

**Redis cache** reduces read latency for redirects and supports rate limiting.  

**Lean reads** are used in read-only queries to reduce Mongoose overhead.  

**Negative caching** reduces repeated DB hits for invalid short codes.  

**Adaptive short code length** increases length on collision retries to reduce duplicate key errors.  

**Rate limiting** protects the redirect endpoint from abuse and shields DB/Redis.  

**Centralized error handler** ensures stable error contracts and easier observability.

**Repository layer** keeps DB queries out of services/controllers.
