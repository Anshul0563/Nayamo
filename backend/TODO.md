# Backend Audit - Implementation TODO

## Phase 1: Security Hardening (Critical)
- [x] AUDIT_PLAN.md created
- [ ] 1.1 Update package.json with security dependencies
- [ ] 1.2 Create asyncHandler utility
- [ ] 1.3 Create errorMiddleware (centralized error handling)
- [ ] 1.4 Harden server.js (helmet, rate-limit, mongo-sanitize, xss-clean, hpp, cors, trust proxy, graceful shutdown)
- [ ] 1.5 Fix uploadMiddleware (file validation, size limits, memoryStorage)
- [ ] 1.6 Fix authMiddleware (JWT_SECRET check, token expiry handling)
- [ ] 1.7 Fix adminMiddleware (defense in depth)
- [ ] 1.8 Protect delhiveryRoutes
- [ ] 1.9 Fix User model (email validation, password constraints, indexes)
- [ ] 1.10 Fix Product model (add indexes)
- [ ] 1.11 Fix Order model (add indexes)
- [ ] 1.12 Fix Cart model (add indexes)
- [ ] 1.13 Fix Wishlist model (schema fix + indexes)

## Phase 2: Data Integrity & Bug Fixes (Critical)
- [ ] 2.1 Fix wishlistController/schema mismatch
- [ ] 2.2 Fix cartController duplicate route bug
- [ ] 2.3 Add database transactions to orderService.placeOrder
- [ ] 2.4 Restore stock on order cancellation
- [ ] 2.5 Fix paymentController (real Razorpay integration)
- [ ] 2.6 Add idempotency to order creation
- [ ] 2.7 Fix getSingleOrder to validate ObjectId

## Phase 3: Performance & Scalability (High)
- [ ] 3.1 Add pagination metadata to productService
- [ ] 3.2 Add pagination to adminService endpoints
- [ ] 3.3 Add database indexes to all models
- [ ] 3.4 Optimize cartService population

## Phase 4: Code Quality & Reliability (Medium)
- [ ] 4.1 Add request validation middleware (auth, product, order routes)
- [ ] 4.2 Standardize API response format across all controllers
- [ ] 4.3 Add input sanitization to all controllers
- [ ] 4.4 Remove dead code (authService or use it)
- [ ] 4.5 Fix delhiveryController error handling

## Phase 5: Deployment & Production (Medium)
- [ ] 5.1 Fix package.json scripts (production start)
- [ ] 5.2 Create .env.example
- [ ] 5.3 Add startup environment validation
- [ ] 5.4 Final integration test

