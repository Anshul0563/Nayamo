# Fix React useRef Error on Vercel (Admin Panel)

## Plan Status: ✅ Approved

## Steps:

### 1. [ ] Update admin/package.json
- Upgrade react-scripts to 5.1.0
- Add react-error-boundary

### 2. [ ] Create admin/src/ErrorBoundary.jsx
- Global error boundary for React null crashes

### 3. [ ] Update admin/src/index.js
- Conditional StrictMode (disable in prod)

### 4. [ ] Update admin/craco.config.js
- Enhanced webpack prod config

### 5. [ ] Update admin/vercel.json
- Headers + clean install flags

### 6. [ ] Test build: cd admin && npm install && npm run build

### 7. [ ] Deploy & Test
- Push to Vercel
- Verify on vercel.app

**Current Progress: Starting Step 1**

---

**Root Cause:** Production chunk loading failure (chunk-EVOBXE3Y.mjs) → React null when useRef called
**Files Analyzed:** DataTable.jsx, RealTimeFeed.jsx, Header.jsx, StatCard.jsx, App.js, index.js, package.json, craco.config.js

