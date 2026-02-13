# URL-Shortener API

Backend API for short links with redirects, analytics, caching, and rate limiting. This README focuses on architecture, performance characteristics, and local setup.

## Architecture (simple)

```text
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

```text
x-api-key: <your_api_key>
```

API keys are stored on the `User` model. Create a user with a unique `apiKey` in the database or add your own user creation endpoint.

## Request Validation

All endpoints use schema-based validation (Zod). Invalid requests return a 400 with validation details.

## Cache Strategy

Redis caches each short code with a JSON payload:

```json
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

```json
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

#### Option A: Windows (Memurai)

1. Install Memurai from [memurai.com](https://www.memurai.com).
2. Start the Memurai service:

```powershell
Get-Service *memurai*
Start-Service memurai
```

1. Verify Redis is running:

```powershell
& "C:\Program Files\Memurai\memurai-cli.exe" ping
```

You should see `PONG`.

#### Option B: WSL (Ubuntu)

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

---

## Performance Improvements (Measured)

Benchmarked locally under concurrent load using autocannon. Results will vary by hardware, OS, and whether Redis/MongoDB are local or remote.

### Valid Redirects (Positive Caching Enabled)

- Sustained **~1,365 requests/sec** under **100 concurrent connections**
- Average latency: **~73 ms**
- 95th percentile latency: **~138 ms**
- Throughput improved by **~12×** compared to DB-only baseline
- Latency reduced by **~92%** compared to DB-only baseline

### Invalid Redirects (Negative Caching Enabled)

- Sustained **~1,044 requests/sec** under **100 concurrent connections**
- Average latency reduced from **~909 ms** (negative caching disabled) to **~95 ms** (negative caching enabled)
- Repeated invalid DB lookups reduced by **90%+**
- Throughput improved by **~9×** compared to baseline

These improvements were achieved by eliminating repeated MongoDB reads through Redis-based positive and negative caching.

---

## How to Benchmark and Reproduce Metrics

### Prerequisites

- Server running locally
- Redis running
- At least one valid short code available in the database

For consistent results, temporarily disable features that can skew performance measurements:

```env
RATE_LIMIT_ENABLED=false
CLICK_LOG_ENABLED=false
```

Notes:

- Restart the server after changing environment variables.
- On Windows PowerShell, use `npx.cmd` instead of `npx`.

### 1) Benchmark Valid Redirect (Cache Enabled)

Ensure:

```env
CACHE_ENABLED=true
NEGATIVE_CACHE_ENABLED=true
```

Run:

```bash
npx autocannon -c 100 -d 20 http://localhost:3000/api/v1/redirect/<valid_code>
```

Record:

- Req/Sec (Avg)
- Latency (Avg)
- Tail latency (use the 95th percentile if available; autocannon defaults to 97.5% in its table)

### 2) Measure Baseline (Disable Cache)

Disable caching:

```env
CACHE_ENABLED=false
```

Restart the server and run the same autocannon command again.

Compute latency reduction:

$$\frac{\text{latency}_{no\_cache} - \text{latency}_{cache}}{\text{latency}_{no\_cache}} \times 100$$

### 3) Benchmark Negative Caching (Invalid Code)

Enable DB lookup counter:

```env
DB_LOOKUP_COUNTER=true
```

#### A) Negative caching disabled

```env
CACHE_ENABLED=true
NEGATIVE_CACHE_ENABLED=false
```

Restart the server.

Run:

```bash
npx autocannon -c 100 -d 20 http://localhost:3000/api/v1/redirect/invalidcode
```

Monitor server logs and note the `DB_LOOKUP` counter value.

#### B) Negative caching enabled

```env
NEGATIVE_CACHE_ENABLED=true
```

Restart the server and run the same command again.

Compute DB hit reduction:

$$\frac{\text{db}_{off} - \text{db}_{on}}{\text{db}_{off}} \times 100$$

### 4) Link creation rate (POST /links)

Use a real API key from `node scripts/createUser.js <name>`.

```bash
npx autocannon -c 20 -d 15 \
  -H "content-type: application/json" \
  -H "x-api-key: YOUR_KEY" \
  -m POST \
  -b '{"originalUrl":"https://example.com"}' \
  http://localhost:3000/api/v1/links
```
