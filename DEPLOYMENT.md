# 🚀 Nayamo Production Deployment Guide (Vercel Frontend + Render Backend)

## Backend (Render.com) https://nayamo.onrender.com

### 1. Git Push
```bash
git add .
git commit -m "Deploy Nayamo prod"
git push origin main
```

### 2. Render Dashboard (render.com)
- New → Web Service → GitHub repo
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Plan**: Free/Starter

### 3. Environment Variables (.env → Render Dashboard)
```
MONGO_URI=mongodb+srv://...
JWT_SECRET=your-64-char-secret
CORS_ORIGINS=https://nayamo-client.vercel.app,https://nayamo-admin.vercel.app,http://localhost:3000,http://localhost:3001
RAZORPAY_KEY_ID=rzp...
RAZORPAY_KEY_SECRET=...
DELHIVERY_API_KEY=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@nayamo.com
SMTP_PASS=app-password
NODE_ENV=production
PORT=10000
```

### 4. Health Check
```
curl https://nayamo.onrender.com/health
```

## Frontend Client (Vercel) nayamo-client.vercel.app

### 1. Vercel CLI
```bash
cd client
npm i -g vercel
vercel --prod
```

### 2. Env Vars (Vercel Dashboard)
```
VITE_API_URL=https://nayamo.onrender.com/api/v1
```

### 3. vercel.json (✅ exists)
```
{
  "routes": [{"src": "/(.*)", "dest": "/index.html"}],
  "headers": [{"source": "/(.*)", "headers": [{"key": "Cache-Control", "value": "public, max-age=0, s-maxage=1800"}]}]
}
```

## Admin Panel (Vercel) nayamo-admin.vercel.app

### 1. Vercel CLI
```bash
cd admin
vercel --prod
```

### 2. Env Vars
```
VITE_API_URL=https://nayamo.onrender.com/api/v1
```

## Production Checklist ✅
- [x] CORS multi-origin + credentials (server.js)
- [x] Vite env (VITE_API_URL)
- [x] Axios token refresh (client/services/api.js)
- [x] Preflight OPTIONS (*)
- [x] Security (helmet/rate-limit/sanitize)
- [x] Socket.IO namespaces (/admin)

## Test Flow
1. Client: Register → Cart → Checkout (Razorpay/COD)
2. Admin: Login → Dashboard → Orders → Analytics
3. Health: Backend /health, Frontend Network tab

**Logs**: Render dashboard → Events
**Custom Domain**: Vercel/Render DNS settings

Nayamo LIVE & SCALING! 💎
