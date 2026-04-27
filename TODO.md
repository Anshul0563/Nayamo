# Backend Production Readiness - Fix Tracker

## Phase 1: Cleanup & Dependencies
- [x] Delete duplicate `backend/backend/` directory
- [x] Update `backend/package.json` with production dependencies
- [x] Install new packages

## Phase 2: Security & Core Fixes
- [x] Fix `seedAdmin.js` - remove hardcoded credentials
- [x] Update `User.js` model - add refresh token tracking
- [x] Update `Product.js` model - add publicId for images
- [x] Fix `server.js` - enforce JWT_REFRESH_SECRET, better sanitization
- [x] Fix `authController.js` - token revocation, rotation
- [x] Fix `authMiddleware.js` - check token blacklist
- [x] Update `cloudinary.js` config - error handling

## Phase 3: Business Logic Fixes
- [x] Fix `orderService.js` - idempotency race condition
- [x] Fix `cartService.js` - edge cases
- [x] Fix `productService.js` - isActive filter, pagination
- [x] Fix `adminController.js` - Cloudinary deletion with publicId
- [x] Fix `paymentController.js` - add webhook endpoint
- [x] Fix `delhiveryController.js` - amount validation
- [x] Fix `wishlistController.js` & model - remove broken pre-save

## Phase 4: Validation & Routes
- [x] Fix `adminRoutes.js` - status enum alignment, product update validation
- [x] Fix `orderRoutes.js` - pagination params
- [x] Fix `uploadMiddleware.js` - file signature validation
- [x] Fix `productRoutes.js` - consistency

## Phase 5: Infrastructure & Monitoring
- [x] Add `winston.js` logger
- [x] Add `pm2.config.js`
- [x] Add `Dockerfile` & `docker-compose.yml`
- [x] Add `.env.example`
- [x] Add `jest` test setup
- [x] Add Redis caching layer
- [x] Add rate limit whitelist for health checks

## Phase 6: Final Verification
- [x] Run security audit
- [x] Check all imports
- [x] Verify no stale code remains
