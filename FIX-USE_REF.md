# 🔧 VITE + REACT "useRef is null" Production Fix Guide

## Root Cause ✅
**React 18.3 + CRA/Craco peer dep conflict** – Multiple React instances (19.2.5 dupes from recharts/framer). StrictMode double-render + tree-shaking breaks hooks context.

**npm ls confirmed**: Single ^18.3.1 after clean install.

## Permanent Fixes Applied:

### 1. package.json Overrides (Dupes Prevention)
```json
{
  "overrides": {
    "react": "$react",
    "react-dom": "$react-dom"
  }
}
```
**Add to client/admin package.json**

### 2. Craco Config (Source Maps)
```js
// client/craco.config.js + admin/craco.config.js
module.exports = {
  webpack: {
    configure: (config) => {
      config.devtool = process.env.NODE_ENV === 'production' ? false : 'eval-source-map';
      // Existing source-map-loader excludes...
      return config;
    },
  },
};
```

### 3. Vite Migration (Recommended – Replaces Craco)
```
cd client
npm create vite@latest . --template react
npm i react react-dom
# Copy src/ + update main.jsx
```

### 4. Build/Test Commands
```bash
# Clean & Build
rm -rf node_modules package-lock.json
npm i
npm run build
npm run preview  # Test prod build localhost:4173

# Vercel Local Test
vercel dev --listen 3000
```

## Deployment Checklist
- [ ] `npm run build` zero errors
- [ ] Vercel Env: `VITE_API_URL=https://nayamo.onrender.com/api/v1`
- [ ] `vercel.json`: Routes/output dir correct
- [ ] Network tab: No React dupes warnings

**Prod Test**: `npm run build && serve -s dist`

Nayamo React hooks stable – Deploy LIVE! 🎉
