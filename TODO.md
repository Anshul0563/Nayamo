# Nayamo Deployment TODO
Status: [1/14] ✅ TODO.md created

## Backend - Render
- [ ] 1. Login to Render.com → New Web Service → Connect GitHub repo `Anshul0563/Nayamo`
- [ ] 2. Root Directory: `backend`
- [ ] 3. Build Command: `npm install`
- [ ] 4. Start Command: `npm start`
- [ ] 5. Set Environment Variables (copy from backend/.env, update MONGO_URI to Atlas prod, generate prod JWT secrets, add Razorpay test keys)
- [ ] 6. Deploy → Note URL (e.g. https://nayamo-backend.onrender.com) → Test /health

## Admin Frontend - Vercel
- [ ] 7. Login to Vercel.com → Import Project → GitHub `Anshul0563/Nayamo`
- [ ] 8. Root Directory: `admin` | Build Command: `npm install &amp;&amp; npm run build` | Output: `build`
- [ ] 9. Env Var: `REACT_APP_API_URL=https://[render-backend].onrender.com/api/v1`
- [ ] 10. Deploy → Test admin login

## Client Frontend - Vercel  
- [ ] 11. New Project → GitHub `Anshul0563/Nayamo`
- [ ] 12. Root Directory: `client` | Build: same as admin
- [ ] 13. Env Var: same `REACT_APP_API_URL`
- [ ] 14. Deploy → Full E2E test (client → backend → admin dashboard)

## Post-Deploy
- [ ] Update backend CORS_ORIGINS if needed (redeploy)
- [ ] Create admin user via /api/v1/auth/register (admin role) or run seedAdmin.js locally → seedAdmin.js
- [ ] Add products via admin panel
- [ ] Test real-time notifications, payments (sandbox)

**Notes:**
- Redis: Skip (not using)
- Whitelist Render outbound IPs in MongoDB Atlas Network Access
- Razorpay/Delhivery: Test keys first
- Free tiers: Render sleeps, Vercel generous
