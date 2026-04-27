# Backend Production Readiness - Fix Tracker

## Phase 1: Cleanup & Dependencies
- [ ] Delete duplicate `backend/backend/` directory
- [ ] Update `backend/package.json` with production dependencies
- [ ] Install new packages

## Phase 2: Security & Core Fixes
- [ ] Fix `seedAdmin.js` - remove hardcoded credentials
- [ ] Update `User.js` model - add refresh token tracking
- [ ] Update `Product.js` model - add publicId for images
- [ ] Fix `server.js` - enforce JWT_REFRESH_SECRET, better sanitization
- [ ] Fix `authController.js` - token revocation, rotation
- [ ] Fix `authMiddleware.js` - check token blacklist
- [ ] Update `cloudinary.js` config - error handling

## Phase 3: Business Logic Fixes
- [ ] Fix `orderService.js` - idempotency race condition
- [ ] Fix `cartService.js` - edge cases
- [ ] Fix `productService.js` - isActive filter, pagination
- [ ] Fix `adminController.js` - Cloudinary deletion with publicId
- [ ] Fix `paymentController.js` - add webhook endpoint
- [ ] Fix `delhiveryController.js` - amount validation
- [ ] Fix `wishlistController.js` & model - remove broken pre-save

## Phase 4: Validation & Routes
- [ ] Fix `adminRoutes.js` - status enum alignment, product update validation
- [ ] Fix `orderRoutes.js` - pagination params
- [ ] Fix `uploadMiddleware.js` - file signature validation
- [ ] Fix `productRoutes.js` - consistency

## Phase 5: Infrastructure & Monitoring
- [ ] Add `winston.js` logger
- [ ] Add `pm2.config.js`
- [ ] Add `Dockerfile` & `docker-compose.yml`
- [ ] Add `.env.example`
- [ ] Add `jest` test setup
- [ ] Add Redis caching layer
- [ ] Add rate limit whitelist for health checks

## Phase 6: Final Verification
- [ ] Run security audit
- [ ] Check all imports
- [ ] Verify no stale code remains

