# Order System Update - Keep All Orders Visible Forever

## Plan Steps (Approved)

### 1. ✅ [DONE] Create this TODO.md
### 2. ✅ [DONE] Disable auto-archiving job
   - Edit backend/jobs/orderCleanup.js: Make cleanupOldOrders a no-op
### 3. ✅ [DONE] Disable cleanup scheduler
   - Edit backend/server.js: Comment out setInterval and setTimeout for runOrderCleanup
### 4. ✅ [DONE] Add UX improvements to MyOrders
   - Edit client/src/pages/MyOrders.jsx: Group into Active/Completed sections
### 5. ✅ [DONE] Restart backend server
### 6. ✅ [DONE] Test & Complete

**Status: ✅ COMPLETE**
* Orders will never be archived/removed from MyOrders.
* Backend lifecycle preserved (statusUpdatedAt, states).
* UX: Active/Completed sections, all visible.
* Restart pm2 backend for changes.

**Status: In Progress**

