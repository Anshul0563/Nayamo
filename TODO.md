# Order Cleanup System - Implementation TODO

## Backend
- [ ] 1. Update Order model - add statusUpdatedAt and isArchived fields
- [ ] 2. Update Order service - set statusUpdatedAt when status becomes final state
- [ ] 3. Update getUserOrders to ignore isArchived (return all orders for users)
- [ ] 4. Update getAllOrders (admin) to filter isArchived = false by default
- [ ] 5. Create cron job for daily order cleanup/archive

## Frontend (Optional)
- [ ] 6. Add Order History page for admin to view archived orders

## Implementation Steps

### Step 1: Order Model Update
File: backend/models/Order.js
- Add statusUpdatedAt: Date field
- Add isArchived: Boolean (default: false)
- Add compound index for efficient queries

### Step 2: Order Service Update  
File: backend/services/orderService.js
- Update updateOrderStatus to set statusUpdatedAt when status becomes final state
- Update getUserOrders to NOT filter by isArchived (user sees all)
- Update getAllOrders to filter isArchived = false by default

### Step 3: Cron Job
File: backend/jobs/orderCleanup.js (new file)
- Run daily at midnight
- Find orders in final states where 30+ days since statusUpdatedAt
- Set isArchived = true

### Step 4: Update server.js
File: backend/server.js
- Import and schedule the cron job

### Step 5: Admin Routes Update (Optional)
File: backend/routes/adminRoutes.js
- Add query param to include archived orders
