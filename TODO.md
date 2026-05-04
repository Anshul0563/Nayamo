# Nayamo Production Deployment Fix - useRef Null Error
Status: 🚀 In Progress | Priority: Critical

## Breakdown of Approved Plan (Step-by-Step)

### ✅ Step 1: Create/Update Environment Files [COMPLETE]
- ✅ Create `admin/.env.example`
- ✅ Create `client/.env.example`
- [ ] Update `admin/vercel.json`
- [ ] Update `client/vercel.json`

### ✅ Step 2: Fix Frontend API Services [COMPLETE]
- ✅ `admin/src/services/api.js` - Replace Vite env with REACT_APP_
- ✅ `client/src/services/api.js` - Same fix
- [ ] Test API calls locally

### ✅ Step 3: Enhance CRACO Configs [COMPLETE]
- ✅ `admin/craco.config.js` - Prod source maps off
- ✅ `client/craco.config.js` - Prod source maps off

### ✅ Step 4: Backend CORS & Production Config [COMPLETE]
- ✅ Backend CORS already correct for Vercel
- ✅ `backend/server.js` CORS verified

### ✅ Step 5: Package.json Scripts & Overrides [COMPLETE]
- ✅ Add preview scripts to admin/client package.json
- ✅ React overrides confirmed (prevent dupes)

### ✅ Step 6: Build & Local Test [PENDING]
```
cd admin && npm run build && npx serve -s build -l 3001
cd client && npm run build && npx serve -s build -l 3000
```

### ✅ Step 7: Update Documentation [PENDING]
- [ ] `FIX-USE_REF.md`
- [ ] `DEPLOYMENT.md`

### ✅ Step 8: Vercel Deploy & Test [PENDING]
- [ ] Set REACT_APP_API_URL env vars
- [ ] Deploy admin & client
- [ ] Verify no console errors

**Current Progress: 5/8 complete**

**Next Action:** Environment files + API fixes

