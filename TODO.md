# TODO - Client forgot password

## Steps
1. Update `client/src/services/api.js` to add placeholder auth endpoints for forgot/reset password.
2. Update `client/src/context/AuthContext.jsx` with `forgotPassword` and/or `resetPassword` helpers (client-side only).
3. Update `client/src/pages/Login.jsx` to add a **Forgot password** UI and flow toggle.
4. Run client lint/build/tests to confirm no JSX errors.
2. Update `admin/src/components/layout/Header.jsx` to avoid fixed-width search (w-56/w-80) overflowing; ensure dropdown widths and spacing behave on small screens.
3. Update `admin/src/components/layout/Sidebar.jsx` to ensure collapsed/overlay sidebar works smoothly with viewport height and avoids layout shift.
4. Make `admin/src/components/DataTable.jsx` more responsive: remove fixed `w-64` search width, ensure header wraps on small screens, and keep horizontal scrolling contained.
5. Review and fix the main pages’ responsive behavior:
   - `admin/src/pages/Dashboard.jsx` (grid spacing, ensure cards/charts wrap)
   - `admin/src/pages/Orders.jsx` (tab bar and header controls)
   - `admin/src/pages/Inventory.jsx` (filters/header and edit modal)
   - `admin/src/pages/Analytics.jsx` (header controls and grid)
   - `admin/src/pages/Payments.jsx`
   - `admin/src/pages/Returns.jsx`
   - Remaining pages: `Users.jsx`, `Reviews.jsx`, `Settings.jsx`, `AddProduct.jsx`, `Login.jsx`.
6. Add any missing responsive styles in `admin/src/index.css` (e.g., scrollbar-hide behavior, page-enter overflow) without breaking themes.
7. Run admin lint/build/tests (if available) to ensure no JSX/className syntax regressions.

