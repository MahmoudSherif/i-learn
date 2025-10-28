# ElecCourse Backend API

Node.js + Express API server with Bunny Stream integration and advanced anti-sharing protection.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your Bunny Stream credentials

# Start development server
npm start
```

The server will start on port 3001 (or PORT environment variable).

## 📋 API Endpoints

### POST /hls-play

Get a signed HLS URL for video playback with anti-sharing protection.

**Request:**
```json
{
  "userId": "user123",
  "email": "student@example.com", 
  "videoId": "VID123",
  "deviceId": "DEV456",
  "sessionId": "optional-existing-session-id",
  "ttlSeconds": 900,
  "endPrevious": false
}
```

**Response:**
```json
{
  "url": "https://vz-xxx.b-cdn.net/bcdn_token=...&expires=...&token_path=%2FVID123%2F/VID123/playlist.m3u8",
  "expires": 1699123456,
  "watermark": "student@example.com • dev:DEV45678 • sid:abc12345 • 2024-01-15T10:30:00.000Z",
  "sessionId": "abc12345-6789-def0-1234-567890abcdef",
  "hbSec": 60
}
```

**Error Responses:**
- `400` - Missing required fields
- `409` - `{ "requireEndPrevious": true }` - Another session active, confirmation needed
- `429` - Device limit, cooldown, or daily limit exceeded

### POST /heartbeat

Keep session active with regular heartbeat.

**Request:**
```json
{
  "sessionId": "abc12345-6789-def0-1234-567890abcdef"
}
```

**Response:**
```json
{
  "ok": true,
  "expTs": 1699123456
}
```

### POST /end-session

Explicitly end a session.

**Request:**
```json
{
  "sessionId": "abc12345-6789-def0-1234-567890abcdef"
}
```

**Response:**
```json
{
  "ok": true
}
```

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "activeSessions": 5,
  "registeredDevices": 12
}
```

## 🔧 Configuration

All configuration is done via environment variables in `.env`:

### Bunny Stream Settings

```bash
# Required: Get from Stream → Library → Settings → Security
PULL_ZONE_BASE=https://vz-XXXX.b-cdn.net
BUNNY_CDN_TOKEN_KEY=your-advanced-cdn-token-key

# Token settings
TOKEN_TTL_SECONDS=900          # 15 minutes default
BIND_IP=false                  # Set true in production
ALLOWED_COUNTRIES=EG,SA        # Optional country restrictions
SPEED_LIMIT_KBPS=1500         # Optional bandwidth limit
```

### Anti-Sharing Protection

```bash
MAX_CONCURRENT=1               # Max concurrent sessions per user
MAX_DEVICES=2                  # Max registered devices per user  
HEARTBEAT_SECONDS=60           # Heartbeat interval
GRACE_SECONDS=120              # Grace period before expiry
COOLDOWN_SECONDS=300           # 5min cooldown between switches
SESSION_STARTS_PER_DAY=20      # Daily session start limit
REQUIRE_HARD_TAKEOVER=true     # Require confirmation for takeover
```

## 🐰 Bunny Stream Setup

### 1. Enable CDN Token Authentication

1. Go to **Stream → Your Library → Settings → Security**
2. Turn ON **CDN token authentication (Advanced)**
3. Copy the **Token Authentication Key** (NOT the iframe key)
4. Add it to your `.env` as `BUNNY_CDN_TOKEN_KEY`

### 2. Configure Security Settings

1. Turn ON **Block direct URL file access**
2. In **Allowed domains**, add:
   - `localhost` (for development)
   - Your production domain (e.g., `app.yourdomain.com`)
   - **Note:** Use hostnames only, no protocols

### 3. Get Pull Zone URL

1. Go to **Stream → Your Library → Settings → General**
2. Copy the **Pull Zone URL** (e.g., `https://vz-1234567.b-cdn.net`)
3. Add it to your `.env` as `PULL_ZONE_BASE`

## 🧪 Testing with cURL

### Get Play URL

```bash
curl -s -X POST http://localhost:3001/hls-play \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "email": "test@example.com", 
    "videoId": "your-video-id",
    "deviceId": "device123"
  }' | jq
```

### Send Heartbeat

```bash
# Use sessionId from previous response
curl -s -X POST http://localhost:3001/heartbeat \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "your-session-id"}' | jq
```

### End Session

```bash
curl -s -X POST http://localhost:3001/end-session \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "your-session-id"}' | jq
```

### Test Session Takeover

```bash
# Start first session
RESPONSE1=$(curl -s -X POST http://localhost:3001/hls-play \
  -H "Content-Type: application/json" \
  -d '{"userId":"user1","email":"test@example.com","videoId":"VID123","deviceId":"DEV1"}')

# Try to start second session (should get 409)
curl -s -X POST http://localhost:3001/hls-play \
  -H "Content-Type: application/json" \
  -d '{"userId":"user1","email":"test@example.com","videoId":"VID123","deviceId":"DEV2"}'

# Force takeover
curl -s -X POST http://localhost:3001/hls-play \
  -H "Content-Type: application/json" \
  -d '{"userId":"user1","email":"test@example.com","videoId":"VID123","deviceId":"DEV2","endPrevious":true}'
```

## 🔒 Security Features

### Path-Based Token Authentication

- Tokens authorize entire video directories (`/<videoId>/`)
- Covers playlist.m3u8 and all segment files automatically
- Uses Bunny CDN Token Auth v2 specification

### Anti-Sharing Mechanisms

1. **Device Limits**: Max 2 devices per user account
2. **Concurrent Sessions**: Only 1 active session at a time
3. **Controlled Takeover**: Explicit confirmation required
4. **Cooldown Periods**: 5-minute cooldown between device switches
5. **Daily Limits**: Max 20 session starts per user per day
6. **Heartbeat Monitoring**: Sessions expire without regular heartbeats
7. **IP Binding**: Optional IP address validation (production)

### Token Security

- SHA256 hash with secret key
- Time-limited access (15-minute default)
- Optional geographic restrictions
- Optional bandwidth limiting

## 🚀 Production Deployment

### Deploy to Render

1. **Create New Web Service**
   - Connect your GitHub repository
   - Choose **Frankfurt** region for optimal performance

2. **Environment Variables**
   ```
   PULL_ZONE_BASE=https://vz-XXXX.b-cdn.net
   BUNNY_CDN_TOKEN_KEY=your-token-key
   BIND_IP=true
   REQUIRE_HARD_TAKEOVER=true
   NODE_ENV=production
   ```

3. **Build & Deploy**
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Auto-deploy on git push

### Production Considerations

#### Security Hardening

```bash
# Production environment settings
NODE_ENV=production
BIND_IP=true                    # Enable IP binding
REQUIRE_HARD_TAKEOVER=true     # Require explicit takeover
ALLOWED_COUNTRIES=EG,SA        # Restrict by geography
SPEED_LIMIT_KBPS=1500         # Limit bandwidth
```

#### Data Persistence

**Current**: In-memory storage (development only)

**Production**: Migrate to Redis or database:

```javascript
// Example Redis integration
const redis = require('redis');
const client = redis.createClient(process.env.REDIS_URL);

// Replace in-memory Maps with Redis operations
// Set TTL on sessions, devices, and cooldown data
```

#### Monitoring & Logging

- Add structured logging (Winston/Bunyan)
- Monitor session metrics and abuse patterns
- Set up alerts for high device registration rates
- Track geographic distribution and suspicious IPs

#### Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/hls-play', limiter);
```

## 🐛 Debug Endpoints

Available in development mode only:

```bash
# View active sessions
curl http://localhost:3001/debug/sessions | jq

# View registered devices
curl http://localhost:3001/debug/devices | jq
```

## 📊 Token URL Format

Generated URLs follow this pattern:

```
https://vz-XXXX.b-cdn.net/bcdn_token=<TOKEN>&expires=<UNIX_TS>[&PARAMS]/<VIDEO_ID>/playlist.m3u8
```

Where:
- `TOKEN`: Base64URL-encoded SHA256 hash
- `UNIX_TS`: Expiration timestamp
- `PARAMS`: Optional query parameters (countries, speed limit)
- `VIDEO_ID`: Your Bunny Stream video identifier

## 🔍 Troubleshooting

### Common Issues

**"BUNNY_CDN_TOKEN_KEY not configured"**
- Check `.env` file exists and has correct token key
- Ensure you're using the **Advanced** CDN token, not iframe token

**403 Forbidden on video playback**
- Verify "Allowed domains" includes your frontend hostname
- Check "Block direct URL file access" is enabled
- Ensure token hasn't expired

**Sessions not expiring**
- Heartbeat cleanup runs every minute
- Check `GRACE_SECONDS` and `HEARTBEAT_SECONDS` configuration
- Monitor debug endpoints for session status

**Device limit errors**
- Check `MAX_DEVICES` setting
- Clear device registrations: restart server (dev) or flush Redis (prod)

### Validation Checklist

- [ ] Bunny Stream CDN token authentication enabled
- [ ] "Block direct URL file access" enabled  
- [ ] Frontend domain added to "Allowed domains"
- [ ] Environment variables properly set
- [ ] Server starts without warnings
- [ ] Health endpoint returns 200 OK
- [ ] Generated URLs include proper token format

---

**Need help?** Check the main README.md for setup instructions and UX guidelines.