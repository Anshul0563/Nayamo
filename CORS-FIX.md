# CORS Configuration - Complete Fix Guide

## Problem Analysis
**Error:** `Cross-Origin Request Blocked: Access-Control-Allow-Origin missing`
**Status:** 204 (preflight OPTIONS request failing)

This indicates the browser's CORS preflight request is not receiving proper headers.

---

## Solution Implemented

### 1. ✅ Updated Server Configuration (`backend/server.js`)

The CORS middleware has been optimized with:

#### Dynamic Origin Validation
```javascript
origin: (origin, callback) => {
  if (!origin || corsOrigins.includes(origin)) {
    return callback(null, true);
  }
  logger.warn(`CORS origin denied: ${origin}`);
  return callback(new Error(`CORS origin not allowed: ${origin}`));
}
```

**Key Points:**
- ✅ **NOT a wildcard** (`*`) - production-safe
- ✅ Allows requests with no origin (mobile apps, curl)
- ✅ Logs denied origins for debugging
- ✅ Validates against whitelist

#### Credential Support
```javascript
credentials: true
```
Allows cookies and authorization headers to be sent with requests.

#### Comprehensive Headers
```javascript
allowedHeaders: [
  'Content-Type',
  'Authorization',
  'X-Requested-With',
  'X-CSRF-Token',
  'Accept',
  'Accept-Language',
  'Content-Language'
]
```

#### Exposed Headers
```javascript
exposedHeaders: [
  'X-Total-Count',
  'X-Page-Number',
  'X-Total-Pages',
  'Content-Disposition'
]
```
These headers are now accessible to frontend JavaScript.

#### Preflight Optimization
```javascript
maxAge: 86400,              // 24 hours caching
preflightContinue: false,
optionsSuccessStatus: 204   // HTTP 204 for successful OPTIONS
```

#### Explicit Preflight Handler
```javascript
app.options('*', cors(corsOptions));
```
Ensures all OPTIONS requests get proper CORS headers.

#### Socket.IO Alignment
Socket.IO CORS is now aligned with Express CORS configuration:
```javascript
const io = socketIo(server, {
  cors: {
    origin: (origin, callback) => { /* same validation */ },
    methods: ['GET', 'POST'],
    credentials: true,
    transports: ['websocket', 'polling']
  }
});
```

---

### 2. ✅ Environment Configuration

Update your `.env` file:

```bash
# CORS Origins (required) - MUST include all frontend domains
CORS_ORIGINS=https://nayamo-client.vercel.app,https://nayamo-admin.vercel.app,http://localhost:3000,http://localhost:5173

# Frontend URLs (optional but recommended for flexibility)
CLIENT_URL=https://nayamo-client.vercel.app
ADMIN_URL=https://nayamo-admin.vercel.app

# Database & JWT
MONGO_URI=<your-mongodb-uri>
JWT_SECRET=<your-jwt-secret>

# Other required variables
# ... existing vars
```

**IMPORTANT:** 
- NO trailing slashes in URLs
- NO `http://*` or `https://*` wildcards
- Separate multiple origins with commas
- Must include both local development and production URLs

---

## Allowed Origins (Production)

| Environment | Origin | Notes |
|---|---|---|
| Local Dev | `http://localhost:3000` | React CRA |
| Local Dev | `http://localhost:5173` | Vite dev server |
| Local Dev | `http://127.0.0.1:3000` | Alternative localhost |
| Production | `https://nayamo-client.vercel.app` | Client frontend |
| Production | `https://nayamo-admin.vercel.app` | Admin panel |
| Backend | `https://nayamo.onrender.com` | Self-requests |

---

## Allowed Request Methods

```
GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD
```

---

## Allowed Request Headers

Frontend can send:
- `Content-Type` - JSON payloads
- `Authorization` - Bearer tokens
- `X-Requested-With` - AJAX requests
- `X-CSRF-Token` - CSRF protection
- `Accept` - Content negotiation
- `Accept-Language` - Localization

---

## Exposed Response Headers

Backend can send:
- `X-Total-Count` - Pagination info
- `X-Page-Number` - Current page
- `X-Total-Pages` - Total pages
- `Content-Disposition` - File downloads

## 2. ✅ Frontend Configuration (Critical Fix)

Update your axios client in both `client/` and `admin/` apps:

**File:** `src/services/api.js`

```javascript
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true,  // ← ADD THIS LINE (CRITICAL!)
  headers: {
    "Content-Type": "application/json",
  },
});
```

**⚠️ IMPORTANT:** Without `withCredentials: true`, the browser blocks CORS requests with credentials.

### Environment Variables for Vercel

Create `.env.local` in both client and admin folders:

```bash
REACT_APP_API_URL=https://nayamo.onrender.com/api/v1
```

**For Vercel Deployment:**
1. Go to Vercel project → Settings → Environment Variables
2. Add: `REACT_APP_API_URL=https://nayamo.onrender.com/api/v1`
3. Redeploy

---

### 1. Test Preflight Request
```bash
curl -X OPTIONS https://nayamo.onrender.com/api/v1/auth/login \
  -H "Origin: https://nayamo-client.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization" \
  -v
```

**Expected Response Headers:**
```
Access-Control-Allow-Origin: https://nayamo-client.vercel.app
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD
Access-Control-Allow-Headers: Content-Type, Authorization, ...
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 86400
```

### 2. Test Actual Request
```bash
curl -X POST https://nayamo.onrender.com/api/v1/auth/login \
  -H "Origin: https://nayamo-client.vercel.app" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}' \
  -v
```

### 3. Browser Console Test
Open browser DevTools and check the login network request:
- **Status:** Should be 200 (not 204)
- **Response Headers:**
  - ✅ `access-control-allow-origin`: Your domain
  - ✅ `access-control-allow-credentials`: true
  - ✅ No CORS error in console

### 4. Health Check
```bash
curl https://nayamo.onrender.com/health | jq .services
```

Output should show:
```json
{
  "corsOrigins": 4,
  "razorpay": true,
  "delhivery": false
}
```

---

## Common Issues & Fixes

### Issue: Still getting CORS error

**Cause 1: Missing `withCredentials: true` in frontend (MOST COMMON)**
```javascript
// ❌ Wrong
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
});

// ✅ Correct
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true,  // ← MUST ADD
  headers: { 'Content-Type': 'application/json' }
});
```

**Cause 2: Environment variable not set on Vercel**
```bash
# Check Vercel dashboard → Settings → Environment Variables
# Must include:
REACT_APP_API_URL=https://nayamo.onrender.com/api/v1
```

**Cause 3: Trailing slash in API URL**
```bash
# ❌ Wrong
REACT_APP_API_URL=https://nayamo.onrender.com/api/v1/

# ✅ Correct
REACT_APP_API_URL=https://nayamo.onrender.com/api/v1
```

**Cause 4: Frontend URL not in Render `CORS_ORIGINS`**
```bash
# On Render backend Settings → Environment Variables:
# Must include the exact Vercel frontend URL
CORS_ORIGINS=https://nayamo-client.vercel.app,https://nayamo-admin.vercel.app,http://localhost:3000,http://localhost:5173
```

### Issue: Cookies not being sent

Frontend must explicitly enable credentials:

```javascript
// Axios (already configured in our fix)
const apiClient = axios.create({
  withCredentials: true  // ✅
});

// Fetch API (if using)
fetch('/api/v1/auth/login', {
  method: 'POST',
  credentials: 'include',  // ✅ MUST ADD
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
})
```

### Issue: Cookies not being sent

Ensure frontend sends credentials:
```javascript
// Fetch API
fetch('/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',  // ← Must include this
  body: JSON.stringify({ email, password })
})

// Axios
axios.defaults.withCredentials = true;
```

### Issue: Socket.IO connection failing

Socket.IO must match Express CORS. The updated server.js now handles this automatically.

---

## Deployment Checklist

- [ ] Update `.env` on Render with correct `CORS_ORIGINS`
- [ ] Verify Vercel frontend URLs are correct (no trailing slashes)
- [ ] Test preflight request with curl (see Testing section)
- [ ] Check browser console for CORS errors
- [ ] Verify cookies are being sent (`credentials: 'include'`)
- [ ] Monitor server logs for "CORS origin denied" warnings
- [ ] Test from each allowed origin

---

## Best Practices

✅ **DO:**
- List all frontend origins explicitly
- Use full URLs (protocol + domain)
- Include both local dev and production URLs
- Validate origins dynamically
- Log denied origins for security audit
- Cache preflight responses (maxAge: 86400)
- Support credentials for authenticated endpoints
- Document allowed origins in README

❌ **DON'T:**
- Use wildcard `*` in production
- Use trailing slashes in origins
- Add spaces in CORS_ORIGINS env var
- Hardcode domains (use env variables)
- Set origin to `*` with credentials enabled
- Forget OPTIONS requests in proxy rules

---

## Monitoring & Logs

The updated server logs CORS activities:

```
✅ CORS Origins enabled: https://nayamo-client.vercel.app, https://nayamo-admin.vercel.app, ...
⚠️ CORS origin denied: https://unknown.com
⚠️ Socket.IO CORS origin denied: https://unknown.com
```

Check server logs on Render to verify CORS is working correctly.

---

## Production Deployment (Render)

1. Go to Render Dashboard → Your Backend Service
2. Click "Environment" tab
3. Add/Update:
   ```
   CORS_ORIGINS=https://nayamo-client.vercel.app,https://nayamo-admin.vercel.app,http://localhost:3000,http://localhost:5173
   CLIENT_URL=https://nayamo-client.vercel.app
   ADMIN_URL=https://nayamo-admin.vercel.app
   NODE_ENV=production
   ```
4. Deploy (auto-redeploy or manual)
5. Test with curl commands above

---

## References

- [MDN CORS Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Express CORS Package](https://github.com/expressjs/cors)
- [Socket.IO CORS](https://socket.io/docs/v4/handling-cors/)
- [OWASP CORS Security](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Origin_Resource_Sharing_Cheat_Sheet.html)

---

## Support

If issues persist:
1. Run curl test (see Testing section)
2. Check `/health` endpoint
3. Monitor Render logs for CORS denials
4. Verify `CORS_ORIGINS` env variable on Render
5. Ensure no spaces in origin URLs
