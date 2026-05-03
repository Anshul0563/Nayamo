# Order System Update - Keep All Orders Visible Forever

## Plan Steps (Approved)

### 1. ✅ [DONE] Create this TODO.md
### 2. Disable auto-archiving job
   - Edit backend/jobs/orderCleanup.js: Make cleanupOldOrders a no-op
### 3. Disable cleanup scheduler
   - Edit backend/server.js: Comment out setInterval and setTimeout for runOrderCleanup
### 4. Add UX improvements to MyOrders
   - Edit client/src/pages/MyOrders.jsx: Group into Active/Completed sections
### 5. Restart backend server
### 6. Test & Complete

**Status: In Progress**

