# Task: Upgrade SHOP navigation & category browsing (Artificial Jewellery types)

## Backend
- [x] Add `anklets` to `jewelleryType` enum in `backend/models/Product.js`
- [x] Add `jewelleryType` query filter in `backend/services/productService.js`
- [x] Add real `best-seller` sort (aggregate Order data) in `backend/services/productService.js`
- [x] Extend cache key to include `jewelleryType`

## Frontend
- [x] Create `client/src/config/jewelleryCategories.js` (shared config + helpers)
- [x] Add premium Shop mega menu (desktop hover + keyboard) to `Navbar.jsx`
- [x] Add expandable Shop categories (tap) to mobile menu in `Navbar.jsx`
- [x] Extend `Shop.jsx` for `jewelleryType` URL param (backend filtering), title + product count, price range, full sort, Clear All, empty state, SEO title

## Verification
- [ ] Backend tests + ESLint on changed files
- [ ] Manual test checklist (hover, category filtering, refresh, back/forward, mobile)
