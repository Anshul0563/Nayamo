# TODO - Admin panel responsiveness

## Plan (approved)
- Update admin layout and key shared components to remove small-screen overflow, tighten responsive spacing, and ensure controls stack/wrap correctly.

## Steps
1. Add/adjust responsive layout utilities in `admin/src/components/layout/AdminLayout.jsx` (main container sizing, min-w-0, overflow rules).
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

