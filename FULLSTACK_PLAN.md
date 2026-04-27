# Nayamo Full-Stack Rebuild — Comprehensive Plan

## Current State Assessment

### Backend (7.1/10)
- **Status:** Already audited and significantly improved
- **What's Done:** JWT auth with token rotation, MongoDB transactions, Redis caching, Winston logging, Docker/PM2 configs, input validation, XSS/NoSQL sanitization, rate limiting, Cloudinary image handling
- **What's Left:** Webhook secret enforcement, CSRF protection, integration tests

### Client Frontend (1/10)
- **Status:** Effectively non-existent
- **What's There:** A "Coming Soon" landing page in `App.js`
- **What's Missing:** Everything — routing, pages, components, API integration, state management, e-commerce functionality

### Admin Panel (4/10)
- **Status:** Basic scaffolding exists
- **What's There:** Routing, ProtectedRoute, API service with interceptors, useApi hook, page skeletons
- **What's Missing:** Functional pages, proper data tables, CRUD operations, real API integration, dashboard analytics

---

## Rebuild Plan

### Phase 1: Frontend Foundation (Client)
1. **Install required dependencies** — react-router-dom, framer-motion, lucide-react, axios, react-hot-toast, recharts
2. **Create global styles** — Tailwind config with Nayamo brand colors (gold/amber, cream, charcoal)
3. **Create API service** — Axios instance with auth interceptors, refresh token flow
4. **Create AuthContext** — Login/register state, token management, user profile
5. **Create CartContext** — Add/remove items, quantity updates, cart totals, localStorage persistence
6. **Create WishlistContext** — Add/remove, sync with backend
7. **Create App Router** — Route definitions with protected routes

### Phase 2: Frontend Pages & Components (Client)
1. **Layout components** — Navbar (with cart/wishlist counters, search), Footer, Mobile menu
2. **Home page** — Hero banner, featured products, new arrivals, categories, testimonials, trust badges, newsletter
3. **Shop page** — Product grid with filters (category, price), sorting, search, pagination
4. **Product Detail page** — Image gallery, variant selector, quantity, add to cart/wishlist, related products
5. **Cart page** — Cart items, quantity controls, summary, checkout CTA
6. **Checkout page** — Shipping form, payment method (COD/Razorpay), order summary
7. **Auth pages** — Login, Register with validation
8. **Account pages** — Profile, My Orders, Wishlist
9. **Track Order page** — Order status tracker
10. **Reusable components** — ProductCard, StarRating, SkeletonLoader, Toast notifications

### Phase 3: Admin Panel
1. **Fix existing structure** — Ensure all pages are functional
2. **Login page** — Working auth with API
3. **Dashboard** — Real stats from backend API, charts
4. **Orders page** — Full CRUD, status updates, pagination
5. **Inventory page** — Product list with search/filter, stock editing
6. **Add/Edit Product** — Image upload, form validation
7. **Analytics page** — Sales charts, top products, revenue
8. **Payments page** — Payment status tracking
9. **Returns page** — Return/refund management
10. **Settings page** — Admin profile/settings

### Phase 4: Backend Fixes for Integration
1. **Add CORS origins** for client and admin dev/prod URLs
2. **Add cookie-based auth option** (for admin panel)
3. **Fix any API response inconsistencies**
4. **Add webhook endpoint** for Razorpay
5. **Add order tracking endpoint**
6. **Add product ratings/reviews model** (if time permits)

### Phase 5: Testing & Polish
1. **Fix all console errors**
2. **Test auth flow** — login, register, token refresh, logout
3. **Test product flow** — browse, filter, add to cart, checkout
4. **Test admin flow** — login, CRUD products, manage orders
5. **Responsive testing** — Mobile, tablet, desktop
6. **Build verification** — Both client and admin build successfully

---

## Design System

### Colors
- **Primary Gold:** #D4A853
- **Dark Gold:** #B8942F
- **Cream/Off-white:** #FDF8F0
- **Charcoal:** #1A1A1A
- **Light Gray:** #F5F5F5
- **Text Dark:** #2D2D2D
- **Text Light:** #6B6B6B

### Typography
- **Headings:** Playfair Display / serif (elegant, luxury)
- **Body:** Inter / sans-serif (clean, modern)
- **Use Google Fonts via CDN**

### Components
- **Buttons:** Rounded, gold accent, subtle hover scale
- **Cards:** Clean white, subtle shadow, rounded corners
- **Inputs:** Minimal border, focus ring in gold
- **Badges:** Small, rounded, category colors

---

## Estimated File Changes

### Client (~30 new/modified files)
- `package.json` — Add framer-motion, lucide-react
- `src/index.css` — Global styles + fonts
- `src/App.js` → Complete rewrite with Router
- `src/services/api.js` — New file
- `src/context/AuthContext.jsx` — New file
- `src/context/CartContext.jsx` — New file
- `src/context/WishlistContext.jsx` — New file
- `src/components/layout/Navbar.jsx` — New file
- `src/components/layout/Footer.jsx` — Rewrite
- `src/components/layout/ClientLayout.jsx` — Rewrite
- `src/components/product/ProductCard.jsx` — New file
- `src/components/product/ProductFilters.jsx` — New file
- `src/components/product/ProductGrid.jsx` — New file
- `src/components/cart/CartItem.jsx` — Rewrite
- `src/components/cart/CartSummary.jsx` — Rewrite
- `src/components/common/EmptyState.jsx` — Rewrite
- `src/components/common/Loader.jsx` — Rewrite
- `src/pages/Home.jsx` — Complete rewrite
- `src/pages/Shop.jsx` — Complete rewrite
- `src/pages/ProductDetails.jsx` — Complete rewrite
- `src/pages/Cart.jsx` — Complete rewrite
- `src/pages/Checkout.jsx` — Complete rewrite
- `src/pages/Login.jsx` — Complete rewrite
- `src/pages/Profile.jsx` — Complete rewrite
- `src/pages/MyOrders.jsx` — Complete rewrite
- `src/pages/TrackOrder.jsx` — Complete rewrite
- `src/hooks/useAuth.js` — Rewrite

### Admin (~15 modified files)
- `src/pages/Login.jsx` — Fix integration
- `src/pages/Dashboard.jsx` — Real data + charts
- `src/pages/Orders.jsx` — Full CRUD
- `src/pages/Inventory.jsx` — Product management
- `src/pages/AddProduct.jsx` — Image upload + form
- `src/pages/Analytics.jsx` — Charts
- `src/pages/Payments.jsx` — Payment tracking
- `src/pages/Returns.jsx` — Return management
- `src/components/layout/AdminLayout.jsx` — Sidebar + header
- `src/components/layout/Sidebar.jsx` — Navigation
- `src/components/layout/Header.jsx` — Top bar
- `src/components/OrdersTable.jsx` — Data table
- `src/components/SalesChart.jsx` — Chart component
- `src/services/api.js` — Ensure all endpoints

### Backend (~5 modified files)
- `server.js` — CORS origins, webhook endpoint
- `controllers/authController.js` — Cookie auth support
- `controllers/orderController.js` — Add track endpoint
- `models/Review.js` — New (optional)
- `routes/orderRoutes.js` — Add track route

---

## Deliverables
1. Complete audit report of all issues found
2. Full updated code for all three parts
3. Setup instructions (README)
4. Deployment guide
5. Honest production readiness verdict

---

**Total estimated new/modified files: ~50 files**
**This is a major rebuild. Confirm to proceed.**

