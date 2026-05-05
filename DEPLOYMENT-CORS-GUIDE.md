# Complete CORS & Deployment Guide for Nayamo

## 🚀 Quick Summary of Changes

### ✅ Backend (Render)
1. Updated CORS configuration with dynamic origin validation
2. Added helmet security with CORS support
3. Configured Socket.IO CORS to match Express CORS

### ✅ Frontend (Vercel)
1. Added `withCredentials: true` to axios client in both `client/` and `admin/`
2. Created `.env.example` for API URL configuration
3. Ensured proper environment variable setup

---

## 📋 STEP-BY-STEP DEPLOYMENT

### Step 1: Push Code to GitHub

```bash
cd /home/jarvis/Documents/IT/Nayamo
git add -A
git commit -m "fix: CORS configuration with withCredentials for production"
git push origin main
```

---

### Step 2: Configure Render Backend

1. **Go to:** https://dashboard.render.com
2. **Select:** Your backend service (nayamo-backend)
3. **Click:** Environment tab
4. **Add/Update these variables:**

```
NODE_ENV=production
PORT=5000
MONGO_URI=<your-mongo-uri>
JWT_SECRET=<your-jwt-secret>
JWT_REFRESH_SECRET=<your-jwt-refresh-secret>

# ✅ CORS Configuration (no spaces, no trailing slashes)
CORS_ORIGINS=https://nayamo-client.vercel.app,https://nayamo-admin.vercel.app,http://localhost:3000,http://localhost:5173

# Frontend URLs
CLIENT_URL=https://nayamo-client.vercel.app
ADMIN_URL=https://nayamo-admin.vercel.app

# Other services (if applicable)
RAZORPAY_KEY_ID=<your-key>
RAZORPAY_KEY_SECRET=<your-secret>
DELHIVERY_API_KEY=<your-key>

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<your-email>
SMTP_PASS=<your-app-password>
CONTACT_EMAIL=support@nayamo.com

# Cloudinary
CLOUDINARY_CLOUD_NAME=<your-name>
CLOUDINARY_API_KEY=<your-key>
CLOUDINARY_API_SECRET=<your-secret>

# Redis (optional)
REDIS_URL=<your-redis-url>
```

5. **Click:** Deploy
6. **Wait:** For deployment to complete

---

### Step 3: Configure Vercel - Client Frontend

1. **Go to:** https://vercel.com/dashboard
2. **Select:** nayamo-client project
3. **Click:** Settings → Environment Variables
4. **Add:**

```
REACT_APP_API_URL=https://nayamo.onrender.com/api/v1
```

5. **Click:** Save
6. **Redeploy:** Go to Deployments → Redeploy

---

### Step 4: Configure Vercel - Admin Frontend

1. **Go to:** https://vercel.com/dashboard
2. **Select:** nayamo-admin project
3. **Click:** Settings → Environment Variables
4. **Add:**

```
REACT_APP_API_URL=https://nayamo.onrender.com/api/v1
```

5. **Click:** Save
6. **Redeploy:** Go to Deployments → Redeploy

---

## ✅ Verification Checklist

### Backend (Render)
- [ ] Deploy successful (no build errors)
- [ ] Service shows "Live"
- [ ] CORS_ORIGINS environment variable is set
- [ ] Check `/health` endpoint returns CORS info

```bash
curl https://nayamo.onrender.com/health | jq .
```

Expected output includes:
```json
{
  "status": "OK",
  "db": "connected",
  "services": {
    "corsOrigins": 4
  }
}
```

### Frontend (Vercel)

**For Client:**
```bash
# Check environment variable is set
curl https://nayamo-client.vercel.app/
# Look in Network tab → request to backend
# Should have headers:
# - Authorization: Bearer ...
# - Content-Type: application/json
```

**For Admin:**
```bash
# Check environment variable is set
curl https://nayamo-admin.vercel.app/
# Look in Network tab → request to backend
```

---

## 🧪 Manual CORS Testing

### Test 1: Preflight Request
```bash
curl -X OPTIONS https://nayamo.onrender.com/api/v1/auth/login \
  -H "Origin: https://nayamo-client.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization" \
  -v
```

**Expected Response Headers:**
```
< HTTP/1.1 204 No Content
< Access-Control-Allow-Origin: https://nayamo-client.vercel.app
< Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD
< Access-Control-Allow-Credentials: true
< Access-Control-Max-Age: 86400
```

### Test 2: Actual Login Request
```bash
curl -X POST https://nayamo.onrender.com/api/v1/auth/login \
  -H "Origin: https://nayamo-client.vercel.app" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token" \
  -d '{"email":"test@example.com","password":"Test123!"}' \
  -v
```

**Expected:**
- Status: 200 (not 204)
- Response headers include: `Access-Control-Allow-Origin`
- No CORS errors in console

### Test 3: Browser Console Test (in frontend)
1. Open DevTools (F12)
2. Go to Console
3. Try login
4. **Expected:** Login succeeds, no CORS errors

---

## 🔍 Troubleshooting

### Error: "CORS header 'Access-Control-Allow-Origin' missing"

**Check 1:** Is `CORS_ORIGINS` environment variable set on Render?
```bash
# SSH into Render container or check dashboard
# Environment should show CORS_ORIGINS=...
```

**Check 2:** Does frontend have `withCredentials: true`?
```javascript
// Check in client/src/services/api.js
const apiClient = axios.create({
  withCredentials: true,  // ← Must be present
});
```

**Check 3:** Is the frontend URL exactly in CORS_ORIGINS?
```bash
# Frontend sends: https://nayamo-client.vercel.app
# CORS_ORIGINS must include: https://nayamo-client.vercel.app
# (no www, no trailing slash)
```

### Error: "CORS request did not succeed"

**Likely cause:** Preflight request (OPTIONS) is failing

**Solution:**
1. Check `app.options('*', cors(corsOptions))` is in server.js
2. Ensure helmet is configured with `crossOriginResourcePolicy: false`
3. Verify CORS middleware runs BEFORE other middleware

### Cookies/Credentials not being sent

**Frontend issue:**
```javascript
// ✅ Correct
const apiClient = axios.create({
  withCredentials: true,  // ← MUST be true
});

// Or with fetch
fetch('/api/v1/auth/login', {
  credentials: 'include',  // ← MUST be 'include'
});
```

**Backend issue:**
```javascript
// ✅ Correct in server.js
const corsOptions = {
  credentials: true,  // ← MUST be true
};
```

---

## 📊 CORS Headers Reference

### Request Headers (Frontend sends)
```
Accept: */*
Accept-Encoding: gzip, deflate, br
Accept-Language: en-US,en;q=0.9
Authorization: Bearer <token>
Content-Type: application/json
Origin: https://nayamo-client.vercel.app
User-Agent: Mozilla/5.0...
```

### Response Headers (Backend should send)
```
Access-Control-Allow-Origin: https://nayamo-client.vercel.app
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD
Access-Control-Allow-Credentials: true
Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, ...
Access-Control-Max-Age: 86400
Access-Control-Expose-Headers: X-Total-Count, X-Page-Number, ...
```

---

## 📝 Local Development Testing

### Backend
```bash
cd backend
npm run dev
# Server should start without errors
# Look for: ✅ CORS Origins enabled: ...
```

### Frontend (Client)
```bash
cd client
npm start
# Should connect to http://localhost:5000/api/v1 (or your local backend)
# Login should work
```

### Frontend (Admin)
```bash
cd admin
npm start
# Should connect to http://localhost:5000/api/v1 (or your local backend)
# Login should work
```

---

## 📚 Additional Resources

- [MDN: CORS Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Express CORS Package](https://github.com/expressjs/cors)
- [Axios withCredentials](https://github.com/axios/axios#request-config)
- [Socket.IO CORS](https://socket.io/docs/v4/handling-cors/)
- [Helmet Security Headers](https://helmetjs.github.io/)

---

## ✅ Final Checklist

- [ ] Code changes pushed to GitHub
- [ ] Render environment variables updated
- [ ] Vercel environment variables (both client and admin) updated
- [ ] Both frontends redeployed on Vercel
- [ ] Backend redeployed on Render
- [ ] Preflight test passes (curl OPTIONS request)
- [ ] Login works on client frontend
- [ ] Login works on admin frontend
- [ ] No CORS errors in browser console
- [ ] Cookies/tokens being saved correctly

---

## 🎉 Success Indicators

✅ Browser console has NO red CORS errors
✅ Login response is HTTP 200 (not 204 or error)
✅ Access token is saved to localStorage
✅ User is redirected to dashboard
✅ Network tab shows proper CORS headers
✅ Backend logs show successful login

---

If issues persist, check the browser's Network tab → login request → Response Headers. You should see `Access-Control-Allow-Origin: https://nayamo-client.vercel.app` header.
