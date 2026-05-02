# Order Cleanup System - Implementation TODO

## Backend
- [x] 1. Update Order model - add statusUpdatedAt and isArchived fields
- [x] 2. Update Order service - set statusUpdatedAt when status becomes final state
- [x] 3. Update getUserOrders to ignore isArchived (return all orders for users)
- [x] 4. Update getAllOrders (admin) to filter isArchived = false by default
- [x] 5. Create cron job for daily order cleanup/archive
- [x] 6. Update server.js to schedule the cron job

## Frontend (Optional)
- [ ] Add Order History page for admin to view archived orders

## Implementation Summary

### Files Modified:
1. **backend/models/Order.js** - Added statusUpdatedAt and isArchived fields
2. **backend/services/orderService.js** - Updated functions for cleanup logic
3. **backend/jobs/orderCleanup.js** - Created cron job for daily cleanup (NEW)
4. **backend/server.js** - Added scheduler for cleanup job

### Behavior:
- **Users**: See ALL their orders (no filtering by isArchived)
- **Admin**: Only see non-archived orders by default
- **Cron Job**: Runs daily, archives orders in final states for 30+ days
