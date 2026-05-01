# Admin Panel Full Upgrade — Implementation Tracker

## Phase 1: Backend API & Core Fixes
- [x] 1.1 Create `backend/models/Settings.js` model
- [x] 1.2 Add missing service methods to `backend/services/adminService.js`
  - [x] `createProduct(data)`
  - [x] `getOrderStats()`
  - [x] `getUserStats()`
  - [x] `getReturns(params)`
  - [x] `updateReturnStatus(id, data)`
  - [x] `getSettings()`
  - [x] `updateSettings(data)`
  - [x] `changePassword(userId, data)`
- [x] 1.3 Add missing controller functions to `backend/controllers/adminController.js`
- [x] 1.4 Add missing routes to `backend/routes/adminRoutes.js`

## Phase 2: Orders Enhancement
- [x] 2.1 Create `admin/src/components/orders/OrderDetailModal.jsx`
- [x] 2.2 Update `admin/src/pages/Orders.jsx`
  - [x] Implement CSV export via ExportButton
  - [x] Add bulk actions UI (bulk status update, bulk cancel)
  - [x] Integrate OrderDetailModal
  - [x] Fix tab counts to use API stats

## Phase 3: Users Pagination Fix
- [x] 3.1 Update `admin/src/pages/Users.jsx`
  - [x] Connect Prev/Next buttons to API
  - [x] Add currentPage state
  - [x] Use totalPages from API response
  - [x] Add bulk delete action

## Phase 4: Inventory Enhancement
- [ ] 4.1 Update `admin/src/pages/Inventory.jsx`
  - [ ] Add bulk selection & bulk delete
  - [ ] Add category filter dropdown
  - [ ] Add sort options (name, price, stock, date)
  - [ ] Add pagination

## Phase 5: Reviews Enhancement
- [ ] 5.1 Update `admin/src/pages/Reviews.jsx`
  - [ ] Add bulk selection + bulk approve/reject
  - [ ] Add date range filter
  - [ ] Improve stats fallback

## Phase 6: Returns Enhancement
- [ ] 6.1 Update `admin/src/pages/Returns.jsx`
  - [ ] Use `adminAPI.getReturns()` endpoint
  - [ ] Add RTO status tab
  - [ ] Add partial refund option
  - [ ] Add return stats from API

## Phase 7: Settings Backend Connection
- [ ] 7.1 Update `admin/src/pages/Settings.jsx`
  - [ ] Load settings from API on mount
  - [ ] Save settings to API
  - [ ] Add password change section
  - [ ] Keep localStorage as cache fallback
