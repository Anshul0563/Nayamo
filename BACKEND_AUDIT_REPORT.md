# Nayamo Backend - Complete Production Audit Report

**Audit Date:** 2025-01-09
**Auditor:** Senior Backend Auditor
**Scope:** Full backend codebase (Node.js/Express/MongoDB)
**Repository:** https://github.com/Anshul0563/Nayamo

---

## Overall Score

| Category | Score (out of 10) | Notes |
|----------|-------------------|-------|
| **Security** | 7.5/10 | Good improvements made. Missing CSRF, webhook secret not enforced, no circuit breakers |
| **Code Quality** | 7/10 | Clean structure, good separation of concerns. Some inconsistency in error handling patterns |
| **Performance** | 7/10 | Redis caching added, pagination implemented. Missing DB query optimization in some areas |
| **Scalability** | 6.5/10 | PM2 cluster mode, Docker ready. Missing horizontal scaling considerations, no read replicas |
| **Maintainability** | 7.5/10 | Good modular structure, Winston logging added. Some files getting large, missing tests |
| **Production Readiness** | 7/10 | Docker, PM2, health checks present. Missing monitoring, alerting, backup strategy |

**Overall Weighted Average: 7.1/10**

---

## Bug Report

### CRITICAL Issues

#### 1. Hardcoded Admin Credentials in seedAdmin.js
- **Severity:** CRITICAL
- **File:** `backend/seedAdmin.js`
- **Status:** FIXED
- **Original Problem:** Admin email and password were hardcoded as `"anshulshakya5632@gmail.com"` and `"Jarvis@563"`. This is a severe security risk as credentials are exposed in version control.
- **How to Reproduce:** Check git history of seedAdmin.js - credentials were visible in plaintext.
- **Fix Applied:** Changed to use environment variables `ADMIN_EMAIL` and `ADMIN_PASSWORD` with validation.
- **Corrected Code:**
```javascript
if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
  console.error("❌ ADMIN_EMAIL and ADMIN_PASSWORD required in .env");
  process.exit(1);
}
const email = process.env.ADMIN_EMAIL.toLowerCase().trim();
const password = process.env.ADMIN_PASSWORD;
```

#### 2. No Refresh Token Rotation or Revocation
- **Severity:** CRITICAL
- **File:** `backend/controllers/authController.js`, `backend/models/User.js`
- **Status:** FIXED
- **Original Problem:** Refresh tokens were stateless JWTs with no server-side tracking. Stolen refresh tokens could be used indefinitely. No logout functionality existed.
- **How to Reproduce:** Login, capture refresh token, use it to get new access tokens even after "logout". No way to invalidate tokens.
- **Fix Applied:** 
  - Added `refreshTokens` array to User model with hashed token storage
  - Implemented token rotation: old refresh token invalidated on use
  - Added `logout` and `logoutAll` endpoints
  - Limited to 5 active refresh tokens per user
- **Corrected Code:** See `backend/models/User.js` and `backend/controllers/authController.js`

#### 3. Fragile Cloudinary Image Deletion
- **Severity:** CRITICAL
- **File:** `backend/controllers/adminController.js`, `backend/models/Product.js`
- **Status:** FIXED
- **Original Problem:** Image deletion parsed publicId from URL using `url.split('/').pop().split('.')[0]`. This breaks if Cloudinary URL format changes or if filenames contain dots.
- **How to Reproduce:** Upload image with filename "product.v2.jpg" - deletion would try to delete "product" instead of "product.v2".
- **Fix Applied:** Changed Product schema to store `{ url, publicId }` objects. Deletion now uses stored `publicId`.
- **Corrected Code:**
```javascript
// In Product model
images: [{ url: String, publicId: String }]

// In deleteProduct controller
if (img.publicId) {
  await cloudinary.uploader.destroy(img.publicId);
}
```

---

### HIGH Severity Issues

#### 4. Broken Wishlist Pre-Save Hook
- **Severity:** HIGH
- **File:** `backend/models/Wishlist.js`
- **Status:** FIXED
- **Original Problem:** The pre-save hook `this.products = [...new Set(this.products.map((id) => id.toString()))]` would convert ObjectIds to strings permanently, breaking references and causing type mismatches.
- **How to Reproduce:** Add same product to wishlist twice. The hook would convert ObjectIds to strings, causing populate() to fail on subsequent queries.
- **Fix Applied:** Removed the broken pre-save hook. Duplicate prevention is now handled in the controller with proper ObjectId comparison.
- **Corrected Code:** See `backend/models/Wishlist.js` (hook removed) and `backend/controllers/wishlistController.js`

#### 5. No MongoDB Transactions in Order Flow
- **Severity:** HIGH
- **File:** `backend/services/orderService.js`
- **Status:** FIXED
- **Original Problem:** Order placement and cancellation had no transactions. Race conditions could cause overselling (two users buying last item simultaneously) or stock inconsistency.
- **How to Reproduce:** Two concurrent requests to place order for last item in stock - both could succeed, resulting in negative stock.
- **Fix Applied:** Wrapped `placeOrder` and `cancelOrder` in MongoDB sessions with transactions. Stock deduction and order creation are now atomic.
- **Corrected Code:** See `backend/services/orderService.js`

#### 6. Weak XSS Sanitization
- **Severity:** HIGH
- **File:** `backend/server.js`
- **Status:** FIXED
- **Original Problem:** Custom XSS sanitization used naive regex replacement that could be bypassed. For example, `<img src=x onerror=alert(1)>` would not be fully sanitized.
- **How to Reproduce:** Send payload with event handlers in HTML attributes - custom sanitizer would miss them.
- **Fix Applied:** Replaced custom sanitization with `express-mongo-sanitize` for NoSQL injection and `dompurify` + `jsdom` for XSS (added to dependencies).
- **Corrected Code:**
```javascript
const mongoSanitize = require("express-mongo-sanitize");
app.use(mongoSanitize());
```

#### 7. Idempotency Race Condition
- **Severity:** HIGH
- **File:** `backend/services/orderService.js`
- **Status:** FIXED
- **Original Problem:** Idempotency check was done before transaction started, allowing duplicate orders in race conditions.
- **How to Reproduce:** Two identical requests with same idempotency key sent simultaneously - both could create orders.
- **Fix Applied:** Moved idempotency check inside transaction. Uses MongoDB unique index on `idempotencyKey` as final guard. Catches duplicate key error and returns existing order.
- **Corrected Code:** See `backend/services/orderService.js` placeOrder function

---

### MEDIUM Severity Issues

#### 8. Missing Redis Caching
- **Severity:** MEDIUM
- **File:** `backend/services/productService.js`, `backend/config/redis.js`
- **Status:** FIXED
- **Original Problem:** Every product listing query hit the database. No caching layer for frequently accessed data.
- **How to Reproduce:** Load product listing page - database query executes every time.
- **Fix Applied:** Added Redis caching with 5-minute TTL for product listings and individual products. Cache invalidation on product create/update/delete.
- **Corrected Code:** See `backend/config/redis.js` and `backend/services/productService.js`

#### 9. No File Signature Validation
- **Severity:** MEDIUM
- **File:** `backend/middleware/uploadMiddleware.js`
- **Status:** FIXED
- **Original Problem:** File upload only checked MIME type (easily spoofed). A `.php` file renamed to `.jpg` would be accepted.
- **How to Reproduce:** Upload file with `Content-Type: image/jpeg` but actual content is executable code.
- **Fix Applied:** Added magic bytes validation checking file signatures (JPEG: FFD8FF, PNG: 89504E47, WebP: 52494646).
- **Corrected Code:** See `backend/middleware/uploadMiddleware.js`

#### 10. Status Enum Mismatch
- **Severity:** MEDIUM
- **File:** `backend/routes/adminRoutes.js`, `backend/models/Order.js`
- **Status:** FIXED
- **Original Problem:** Route validation allowed statuses like "packed", "shipped" that didn't exist in the Order model enum. This would cause validation errors at the database level.
- **How to Reproduce:** Send `status: "packed"` to update order status - route accepts it but database rejects.
- **Fix Applied:** Aligned route validation enum with model enum. Removed non-existent statuses.
- **Corrected Code:** See `backend/routes/adminRoutes.js`

#### 11. No Rate Limit Whitelist for Health Checks
- **Severity:** MEDIUM
- **File:** `backend/server.js`
- **Status:** FIXED
- **Original Problem:** Health check endpoint was rate-limited, causing load balancers to mark the service as unhealthy during high traffic.
- **How to Reproduce:** Send 100+ health check requests in 15 minutes - subsequent requests get 429.
- **Fix Applied:** Added `skip: (req) => req.path === "/health"` to the main rate limiter.
- **Corrected Code:**
```javascript
const limiter = rateLimit({
  // ... other options
  skip: (req) => req.path === "/health",
});
```

#### 12. Missing Input Validation on Admin Product Update
- **Severity:** MEDIUM
- **File:** `backend/routes/adminRoutes.js`
- **Status:** FIXED
- **Original Problem:** `PUT /admin/products/:id` had no validation middleware. Any fields could be sent, including invalid data types.
- **How to Reproduce:** Send `price: "free"` or `stock: -10` to product update endpoint - no validation error.
- **Fix Applied:** Added `productUpdateValidation` with express-validator rules for all updatable fields.
- **Corrected Code:** See `backend/routes/adminRoutes.js`

---

### LOW Severity Issues

#### 13. Missing Test Infrastructure
- **Severity:** LOW
- **File:** `backend/package.json`, `backend/jest.setup.js`
- **Status:** FIXED
- **Original Problem:** No test framework configured. `npm test` just echoed an error.
- **Fix Applied:** Added Jest with supertest, created jest.setup.js with environment mocks, configured coverage collection.
- **Corrected Code:** See `backend/package.json` and `backend/jest.setup.js`

#### 14. Missing Docker Configuration
- **Severity:** LOW
- **File:** `backend/Dockerfile`, `backend/docker-compose.yml`
- **Status:** FIXED
- **Original Problem:** No containerization. Deployment required manual Node.js installation.
- **Fix Applied:** Added multi-stage Dockerfile with non-root user, health checks. Added docker-compose.yml with Redis and MongoDB services.
- **Corrected Code:** See `backend/Dockerfile` and `backend/docker-compose.yml`

#### 15. Missing Process Manager Configuration
- **Severity:** LOW
- **File:** `backend/pm2.config.js`
- **Status:** FIXED
- **Original Problem:** No PM2 configuration for production process management.
- **Fix Applied:** Added PM2 config with cluster mode, memory limits, log rotation, auto-restart.
- **Corrected Code:** See `backend/pm2.config.js`

#### 16. Missing Structured Logging
- **Severity:** LOW
- **File:** `backend/config/logger.js`
- **Status:** FIXED
- **Original Problem:** Used `console.log` throughout. No structured logs for production monitoring.
- **Fix Applied:** Added Winston logger with JSON format, file transports for errors and combined logs.
- **Corrected Code:** See `backend/config/logger.js`

---

## Remaining Issues (Post-Fix)

### MEDIUM - Webhook Secret Not Enforced
- **File:** `backend/server.js`
- **Problem:** The Razorpay webhook endpoint requires `RAZORPAY_WEBHOOK_SECRET` but it's not in the `requiredEnvVars` list at startup. If missing, webhook requests fail with 500.
- **Fix:** Add `RAZORPAY_WEBHOOK_SECRET` to required environment variables or make webhook conditional.

### MEDIUM - No CSRF Protection
- **File:** `backend/server.js`
- **Problem:** No CSRF tokens for state-changing operations. While JWT auth provides some protection, cross-site request forgery is still possible if attacker has valid token.
- **Fix:** Implement CSRF tokens for browser-based clients or use SameSite cookies.

### MEDIUM - No Circuit Breaker for External APIs
- **File:** `backend/utils/axiosInstance.js`, `backend/controllers/delhiveryController.js`
- **Problem:** If Delhivery API is down, requests will hang until timeout. No circuit breaker pattern to fail fast.
- **Fix:** Add circuit breaker (e.g., `opossum` npm package) with fallback responses.

### LOW - Missing Request ID Tracing
- **File:** All controllers
- **Problem:** No correlation IDs for tracing requests across services. Hard to debug issues in production.
- **Fix:** Add `express-request-id` middleware and include requestId in all log entries.

### LOW - Webhook Endpoint Not Rate Limited
- **File:** `backend/server.js`
- **Problem:** The `/webhook/razorpay` endpoint bypasses the main rate limiter (it's defined after routes). Could be flooded with fake webhook requests.
- **Fix:** Add specific rate limiting for webhook endpoint (e.g., 10 req/min per IP).

### LOW - Product Image Upload Missing Signature Validation
- **File:** `backend/routes/adminRoutes.js`
- **Problem:** The `/admin/products/upload` route uses `upload.single("image")` but doesn't apply `validateSignatures` middleware.
- **Fix:** Add `validateSignatures` middleware after upload.

### LOW - Missing MongoDB Backup Strategy
- **File:** Infrastructure
- **Problem:** No automated backup strategy for MongoDB data.
- **Fix:** Add MongoDB backup container in docker-compose or use managed MongoDB Atlas with backups.

### LOW - Missing Monitoring/Alerting
- **File:** Infrastructure
- **Problem:** No application monitoring (APM), error tracking, or alerting.
- **Fix:** Integrate Sentry for error tracking, Prometheus/Grafana for metrics, or PagerDuty for alerts.

---

## Priority Roadmap

### Fix Immediately (Before Production)
1. ✅ Hardcoded credentials removed
2. ✅ Token rotation/revocation implemented
3. ✅ Cloudinary deletion fixed
4. ✅ MongoDB transactions added
5. ✅ XSS sanitization improved
6. ✅ File signature validation added
7. ⏳ Add `RAZORPAY_WEBHOOK_SECRET` to required env vars
8. ⏳ Add rate limiting to webhook endpoint
9. ⏳ Add CSRF protection

### Fix This Week (Before Scaling)
1. ✅ Redis caching implemented
2. ✅ Input validation added
3. ✅ Status enum aligned
4. ⏳ Add circuit breaker for external APIs
5. ⏳ Add request ID tracing
6. ⏳ Add product upload signature validation
7. ⏳ Write integration tests for critical paths (auth, order, payment)

### Improve Later (Ongoing)
1. ✅ Docker configuration added
2. ✅ PM2 configuration added
3. ✅ Winston logging added
4. ⏳ Add MongoDB backup automation
5. ⏳ Add monitoring/alerting (Sentry, Prometheus)
6. ⏳ Implement API versioning strategy (v2 planning)
7. ⏳ Add GraphQL or tRPC for efficient data fetching
8. ⏳ Implement event-driven architecture (RabbitMQ/AWS SNS)
9. ⏳ Add database read replicas for scaling
10. ⏳ Implement automated security scanning (Snyk, Dependabot)

---

## Final Verdict

### Is this backend production ready?
**Yes, with reservations.** The backend has been significantly improved and now meets basic production requirements. The critical security issues (hardcoded credentials, token management, transaction safety) have been resolved. However, it needs the remaining "Fix Immediately" items addressed before handling real paying customers.

### Can it handle real users?
**For small to medium scale (1,000-10,000 users), yes.** The addition of Redis caching, MongoDB transactions, and PM2 clustering provides a solid foundation. For larger scale, you'll need:
- Database read replicas
- CDN for static assets
- Load balancer with multiple API instances
- Comprehensive monitoring

### Biggest Risks
1. **Payment Security:** While Razorpay integration is solid, the webhook endpoint needs rate limiting and the secret must be enforced.
2. **Inventory Consistency:** MongoDB transactions help, but without proper monitoring, stock inconsistencies could go unnoticed.
3. **External API Dependencies:** Delhivery integration has no fallback if their API is down. Orders could pile up without shipping.
4. **No Automated Testing:** Zero test coverage means regressions can slip into production easily.
5. **Data Loss:** No automated MongoDB backups. A production incident could result in permanent data loss.

### What should be rebuilt?
1. **Nothing major needs rebuilding.** The architecture is sound.
2. **The admin frontend** (`admin/src/`) should be reviewed separately - it stores tokens in localStorage which is vulnerable to XSS (though backend now has better XSS protection).
3. **Consider migrating to TypeScript** for better type safety and developer experience.
4. **Consider using a message queue** (BullMQ with Redis) for async operations like order confirmation emails, inventory updates, and webhook processing.

---

## Files Modified/Created During Audit

### Modified Files
- `backend/server.js` - Security middleware, webhook, graceful shutdown
- `backend/package.json` - Dependencies, scripts, Jest config
- `backend/models/User.js` - Refresh token tracking, password hashing hook
- `backend/models/Product.js` - Image schema with publicId
- `backend/models/Wishlist.js` - Removed broken pre-save hook
- `backend/controllers/authController.js` - Token rotation, logout
- `backend/controllers/adminController.js` - Cloudinary deletion, cache invalidation
- `backend/controllers/productController.js` - Image upload with publicId
- `backend/controllers/paymentController.js` - Logging, webhook ready
- `backend/controllers/delhiveryController.js` - Amount validation, logging
- `backend/controllers/wishlistController.js` - ObjectId validation
- `backend/controllers/orderController.js` - Pagination support
- `backend/services/orderService.js` - Transactions, idempotency
- `backend/services/productService.js` - Redis caching
- `backend/services/cartService.js` - isActive filtering
- `backend/routes/adminRoutes.js` - Status enum, product validation
- `backend/routes/orderRoutes.js` - Pagination params
- `backend/middleware/authMiddleware.js` - Password change check
- `backend/middleware/uploadMiddleware.js` - File signature validation
- `backend/config/cloudinary.js` - Secure config
- `backend/seedAdmin.js` - Environment-based credentials

### Created Files
- `backend/config/logger.js` - Winston logging
- `backend/config/redis.js` - Redis connection
- `backend/utils/escapeRegex.js` - ReDoS prevention
- `backend/pm2.config.js` - Process manager config
- `backend/Dockerfile` - Container build
- `backend/docker-compose.yml` - Full stack orchestration
- `backend/jest.setup.js` - Test environment
- `backend/.env.example` - Environment template
- `TODO.md` - Progress tracking

---

## Summary

**Before Audit:** Score ~4/10 - Critical security flaws, no transactions, hardcoded secrets, broken data hooks.

**After Audit:** Score ~7.1/10 - Production-viable with proper environment setup and remaining medium-priority items addressed.

**Recommendation:** Deploy to staging immediately, complete the "Fix Immediately" items, run load tests, then proceed to production with monitoring in place.

