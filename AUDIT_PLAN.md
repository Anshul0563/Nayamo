# Backend Audit Plan - Nayamo E-Commerce

## Information Gathered

### Project Overview
- **Type**: Node.js/Express E-Commerce Backend (Jewelry - Gold/Silver/Diamond)
- **Database**: MongoDB with Mongoose
- **Payment**: Razorpay (partially implemented/mock)
- **Shipping**: Delhivery API integration
- **File Upload**: Multer + Cloudinary
- **Auth**: JWT with bcryptjs

### Files Analyzed (25 backend files)
- `server.js`, `package.json`
- `config/db.js`, `config/cloudinary.js`
- `middleware/authMiddleware.js`, `middleware/adminMiddleware.js`, `middleware/uploadMiddleware.js`
- `models/User.js`, `models/Product.js`, `models/Cart.js`, `models/Order.js`, `models/Wishlist.js`
- `routes/*` (8 route files)
- `controllers/*` (8 controller files)
- `services/*` (5 service files)
- `utils/axiosInstance.js`

---

## Critical Issues Identified (Preliminary)

### 🔴 Security (Critical/High)
1. **No Rate Limiting** - Brute force vulnerable on auth, payment, admin routes
2. **No Helmet/Security Headers** - XSS, clickjacking, MIME sniffing risks
3. **CORS Misconfiguration** - Hardcoded localhost origin, no production config
4. **No Input Validation/Sanitization** - NoSQL injection, XSS risks across all routes
5. **JWT Secret Exposure Risk** - No validation that JWT_SECRET exists
6. **Password Weakness** - No complexity requirements, no max length check (DoS via bcrypt)
7. **File Upload Vulnerabilities** - No file type/size validation, diskStorage leaves temp files
8. **Admin Middleware Gap** - No authentication before admin check (relies on route order)
9. **Delhivery Routes Unprotected** - No auth on shipping endpoints
10. **Payment Controller Mock** - Fake payment verification, no real Razorpay integration
11. **No HTTPS Enforcement** - No trust proxy config for production
12. **MongoDB Injection** - Direct query object spread in `req.query` usage

### 🔴 Data Integrity / Bugs (Critical)
1. **Wishlist Schema Mismatch** - Controller uses `products` array, schema defines `items` array
2. **Cart Remove Route Conflict** - Both `POST /remove` and `DELETE /:id` exist, DELETE uses wrong param
3. **Order Cancellation No Stock Restore** - Cancelled orders don't return inventory
4. **No Transaction Wrappers** - Order placement can leave inconsistent state if fails mid-way
5. **Duplicate Order Prevention Missing** - No idempotency key on order creation
6. **Payment Verification Uses Wrong ID** - `orderId` from Razorpay vs MongoDB `_id` confusion

### 🟡 Performance / Scalability (Medium/High)
1. **No Database Indexes** - No indexes on User.email, Product.category, Order.user, etc.
2. **N+1 Query Problems** - Cart population, order lookups
3. **No Caching** - No Redis for sessions, products, or cart data
4. **No Pagination on Admin Endpoints** - `getAllOrders`, `getAllUsers`, `getAllProducts` return everything
5. **Heavy Dashboard Aggregation** - No caching of stats, runs on every request
6. **No Connection Pooling Config** - Default mongoose pooling only

### 🟡 Code Quality / Maintainability (Medium)
1. **Inconsistent Error Handling** - Some return 500, some 400, no centralized handler
2. **No Request Validation Library** - No Joi/Zod/express-validator
3. **Repeated JWT Logic** - Token generation in both controller and service
4. **No Logging Framework** - Only console.log, no structured logging
5. **No Health Check Endpoint** - No `/health` or `/ready` probes
6. **Missing Async Error Handling** - No wrapper for async route handlers
7. **Dead Code** - `authService.js` exported but unused by controller

### 🟡 Deployment / Production (Medium)
1. **Nodemon in Production** - `npm start` uses nodemon
2. **No Graceful Shutdown** - Server doesn't close DB connections on SIGTERM
3. **No Process Manager Config** - No PM2 ecosystem file
4. **Missing Environment Validation** - No check for required env vars at startup
5. **No Error Tracking** - No Sentry/Datadog integration

---

## Plan: Detailed Code Update Plan

### Phase 1: Security Hardening (Critical)
| File | Change |
|------|--------|
| `server.js` | Add helmet, rate-limit, express-mongo-sanitize, xss-clean, hpp, cors config, trust proxy, global error handler |
| `middleware/uploadMiddleware.js` | Add file type whitelist, size limits, memoryStorage for all uploads |
| `middleware/authMiddleware.js` | Add JWT_SECRET existence check, token blacklist support |
| `middleware/adminMiddleware.js` | Add authentication check (defense in depth) |
| `models/User.js` | Add email regex validation, password min/max length, index on email |
| `routes/delhiveryRoutes.js` | Add protect middleware to all routes |
| `controllers/paymentController.js` | Implement real Razorpay integration with signature verification |

### Phase 2: Data Integrity & Bug Fixes (Critical)
| File | Change |
|------|--------|
| `models/Wishlist.js` | Fix schema to use `products` array OR fix controller to use `items` |
| `controllers/cartController.js` | Fix DELETE route to use correct param, remove duplicate route |
| `services/orderService.js` | Add MongoDB transactions for order placement, restore stock on cancel |
| `controllers/paymentController.js` | Fix orderId mapping between Razorpay and MongoDB |
| `services/orderService.js` | Add idempotency check for duplicate orders |

### Phase 3: Performance & Database (High)
| File | Change |
|------|--------|
| `models/*.js` | Add indexes (User.email, Product.category+price, Order.user+status, etc.) |
| `services/productService.js` | Add pagination metadata (total count, pages) |
| `services/adminService.js` | Add pagination to all list endpoints |
| `config/db.js` | Add connection retry with exponential backoff |

### Phase 4: Code Quality & Reliability (Medium)
| File | Change |
|------|--------|
| All controllers | Add asyncHandler wrapper or try-catch normalization |
| `server.js` | Add centralized error handling middleware |
| `package.json` | Add production start script, add validation dependencies |
| All files | Replace console.log with structured logger (winston/pino) |
| `server.js` | Add graceful shutdown handler |

### Phase 5: Validation & API Quality (Medium)
| File | Change |
|------|--------|
| `routes/*.js` | Add express-validator or Joi validation middleware |
| `controllers/authController.js` | Add password strength validation |
| All controllers | Standardize API response format |

---

## Dependent Files to Edit
- **Primary**: `server.js`, `middleware/*`, `models/*`, `controllers/*`, `services/*`, `routes/*`
- **Config**: `package.json` (add dependencies)
- **New Files**: `.env.example`, `middleware/errorMiddleware.js`, `middleware/asyncHandler.js`, `utils/logger.js`

## Followup Steps
1. Install new dependencies (helmet, express-rate-limit, express-mongo-sanitize, xss-clean, hpp, express-validator, winston, etc.)
2. Create `.env` with all required variables
3. Test all endpoints with Postman/Thunder Client
4. Add API tests (Jest/Supertest)
5. Configure PM2 for production
6. Set up monitoring (Sentry/LogRocket)

---

**Do you approve this plan? Should I proceed with the implementation?**

