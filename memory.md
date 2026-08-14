READ THIS FILE BEFORE MAKING PROJECT CHANGES.

Purpose:
- This file is the repo-level context for the Nayamo project.
- Use it as the first stop for future Copilot sessions and human contributors.
- Before making changes, read this file and then inspect only the files relevant to the requested task.
- Do not scan the whole repository unless a task genuinely requires it.

Project status at a glance:
- Full-stack jewellery e-commerce monorepo.
- Backend: Node.js + Express + MongoDB/Mongoose.
- Storefront: React app in client/.
- Admin dashboard: React app in admin/.
- Current codebase includes live auth, cart, wishlist, product catalog, order lifecycle, refunds, Cloudinary image handling, and payment flows.
- Delhivery support exists as partial/integration-related code, but it should be treated as planned or partial work unless a task explicitly confirms the full workflow is required.
- Do not implement Delhivery end-to-end as part of unrelated work.

Architecture
- Root workspace contains:
  - backend/ for API server, models, services, routes, middleware, tests
  - client/ for the public storefront
  - admin/ for the internal admin dashboard
- The backend is the source of truth for business logic and API behavior.
- Frontends consume JSON APIs and rely on token refresh logic and role-aware access.

Backend stack and runtime
- Runtime: Node.js + Express.
- Database: MongoDB via Mongoose.
- Auth: JWT access + refresh tokens.
- Security middleware includes helmet, CORS, rate limits, mongo sanitization, HPP, and validation middleware.
- Redis is optionally configured via REDIS_URL and is not required for core flows if not set.
- Logging is centralized in backend/config/logger.js.
- Environment configuration is in backend/.env and backend/.env.example.

Core backend entry points
- backend/server.js bootstraps Express, security middleware, CORS, database connection, route mounting, health checks, startup admin bootstrap, and service configuration.
- Routes are mounted by feature:
  - authRoutes.js
  - productRoutes.js
  - cartRoutes.js
  - wishlistRoutes.js
  - orderRoutes.js
  - reviewRoutes.js
  - paymentRoutes.js
  - shippingRoutes.js and delhiveryRoutes.js
  - adminRoutes.js
  - webhookRoutes.js
  - imageRoutes.js
- Controllers coordinate request validation and business logic. Services hold the heavier business logic and transactions.

Auth and user model
- User schema is defined in backend/models/User.js.
- Accounts support both customers and admin users.
- Auth flows include signup, login, logout, password reset, role checks, and profile retrieval.
- Client auth state is managed through client/src/context/AuthContext.jsx using localStorage accessToken, refreshToken, and user.
- Refresh-token retry logic is centralized in client/src/services/api.js.
- Server-side auth enforcement happens via backend/middleware/authMiddleware.js and admin checks via backend/middleware/adminMiddleware.js.

Catalog and product model
- Product data is defined in backend/models/Product.js.
- Product categories and jewellery types are validated by enum-like constraints in the routes and model.
- Product creation and image uploads are handled through backend/controllers/productController.js and Cloudinary.
- Public product listing is available, and admin-only product creation exists.
- Frontend storefront is driven by product listings, filters, and cart/wishlist actions.

Cart, wishlist, and checkout
- Cart routes: backend/routes/cartRoutes.js
- Wishlist routes: backend/routes/wishlistRoutes.js
- Cart and wishlist are user-protected flows.
- Client cart state is in client/src/context/CartContext.jsx and drives storefront and checkout UX.
- Store checkout is implemented in client/src/pages/Checkout.jsx.
- Checkout supports shipping details, COD vs online payment selection, Razorpay SDK integration, and order placement.
- COD can be disabled by payment options state, and the checkout page handles that condition gracefully.

Order lifecycle and status model
- Order schema is the central business model in backend/models/Order.js.
- Key order statuses currently in use:
  - pending
  - confirmed
  - ready_to_ship
  - pickup_requested
  - in_transit
  - out_for_delivery
  - delivered
  - cancelled
  - returned
  - return_requested
  - rto
- Payment status values include pending, paid, failed, refunded.
- Orders also track lifecycle metadata such as deliveredAt, cancelledAt, statusUpdatedAt, payment-related IDs, and refund details.
- Core order operations live in backend/services/orderService.js.
- Customer order actions include:
  - place order
  - get orders
  - get order by id
  - cancel order
  - return order
  - download invoice
- Admin order operations include listing, searching, status updates, and return handling.
- My orders UI is in client/src/pages/MyOrders.jsx and order details UI is in client/src/pages/OrderDetails.jsx.

Payment flow
- Payment service is in backend/services/paymentService.js.
- Razorpay is used for online payments and refunds.
- Payment controller handles creation and verification of Razorpay orders and refund processing.
- The storefront payment flow creates a Mongo order first, then creates a Razorpay order, then opens the Razorpay checkout modal and verifies payment on success.
- Refunds are supported for paid orders and restore product stock when processed.
- Webhooks are handled via backend/controllers/webhookController.js.

Invoice and document generation
- Invoice generation is handled in backend/services/invoiceService.js.
- PDF invoices are generated for order data and made available through order endpoints and downloads.

Cloudinary, uploads, and media
- Cloudinary is configured in backend/config/cloudinary.js.
- Image uploads are used for products and reviews.
- Utility helper exists at backend/utils/cloudinaryUpload.js.
- Product and review controllers upload image data to Cloudinary and clean up resources when needed.
- Image handling is active and should be treated as production behavior.

Admin capabilities
- Admin dashboard app is under admin/src and routes define pages such as:
  - Dashboard
  - Orders
  - Inventory
  - Add Product
  - Payments
  - Analytics
  - Users
  - Reviews
  - Returns
  - Settings
- Admin service includes stats, returns, settings, change password, and inventory management logic.
- Backend/admin routes and controller enforce admin-only access for sensitive operations.
- The admin app uses real-time notification hooks and socket connectivity as part of the admin experience.

External services in use
- MongoDB Atlas
- Cloudinary
- Razorpay
- SMTP/Resend-style email support
- Redis (optional)
- Delhivery API client (partial/integration layer)

Delhivery status and guardrails
- Delhivery integration exists in the project, but it is not the same as a fully launched shipping workflow.
- Relevant implementation is in:
  - backend/services/delhiveryService.js
  - backend/controllers/delhiveryController.js
  - backend/controllers/shippingController.js
  - backend/routes/delhiveryRoutes.js or shippingRoutes.js depending on active route wiring
- The code contains shipment creation, tracking, and cancellation endpoints.
- Order status and delhivery metadata are present in the schema, but the app should not assume full end-to-end Delhivery fulfillment is complete unless an explicit task says so.
- Do not implement Delhivery as a default change for this repo without clearly scoping the task.
- Treat Delhivery as a future/partial integration unless evidence confirms full operational coverage.

Notable workflow details
- Orders have stock updates tied to placement and cancellation.
- Return requests are allowed only for delivered orders within 7 days.
- Final statuses trigger statusUpdatedAt and count toward the 30-day countdown logic.
- Payment refund logic updates order status and restores stock.
- Product and order operations are designed to be transactional where relevant.

Security and environment notes
- Secrets should not be committed or exposed through docs or code examples.
- The project includes real environment variables in backend/.env; do not copy or expose actual secrets in future notes or commits.
- For project changes, keep secrets in environment variables and avoid hardcoding credentials.

Practical guidance for future tasks
- Start with this file, then read only the relevant module(s) for the requested task.
- Prefer evidence from the models, controllers, services, and route definitions before making a change.
- Do not change application logic as part of documentation-only work.
- If a task references Delhivery, verify whether it is truly required and whether the current code actually supports it before implementing.
- If a task is about admin or customer flows, check the relevant frontend page and matching backend route/service together.

Known implementation boundaries
- This repo is not a theoretical template; it is a live e-commerce app with active features.
- The project has a production-oriented setup and multiple external integrations.
- Documentation in this file should be treated as a baseline for architecture and domain understanding, not as a promise of future feature completeness.

Maintenance note
- Update this file when architecture or major workflows change.
- Keep it concise, evidence-based, and task-oriented.
- Prefer recorded facts over assumptions.
