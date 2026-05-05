# React Router useRef Fix - TODO

**Status: Almost Complete**

## Steps:
- [x] Create this TODO.md 
- [x] 1. Fix admin/src/App.js (remove inner BrowserRouter) ✅
- [x] 2. Fix admin/src/index.js (add outer BrowserRouter, no StrictMode) ✅
- [x] 3. Fix client/src/index.js (remove StrictMode/conditional) ✅
- [ ] 4. Clear cache & restart: `cd client && rm -rf node_modules/.cache build && npm start`
- [ ] 5. Test http://localhost:3001/ (should show Home page, no console errors)
- [ ] 6. Complete

**Changes Made**:
```
admin/App.js: Removed <BrowserRouter> (illegal in component)
admin/index.js: Added <BrowserRouter><App /></BrowserRouter> (no StrictMode)
client/index.js: Removed StrictMode + env conditional (Router v6 compat)
```

**Next**: Run restart command, verify app renders.

