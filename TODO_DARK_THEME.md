# Nayamo Dark Premium Theme Redesign - Implementation Plan

## Critical Issues Found
1. **ProductCard.jsx** - Missing closing `</div>` tags (syntax bug)
2. **Home.jsx** - Mixes light backgrounds with dark CSS vars
3. **All pages** - Use `#FDF8F0` light cream backgrounds
4. **ClientLayout** - Light background

## Implementation Steps

### Step 1: Foundation Files
- [x] Update `tailwind.config.js` - Add dark theme custom colors
- [x] Update `ClientLayout.jsx` - Dark background base
- [x] Update `App.js` - Dark 404 page

### Step 2: Core Components
- [ ] Fix & Redesign `ProductCard.jsx` - Fix syntax + dark premium card
- [ ] Update `Footer.jsx` - Consistent dark theme
- [ ] Update `Loader.jsx` - Dark skeletons
- [ ] Update `EmptyState.jsx` - Dark empty states

### Step 3: Pages - Main Shopping Flow
- [ ] Redesign `Home.jsx` - Stunning dark hero, sections, testimonials, newsletter
- [ ] Redesign `Shop.jsx` - Dark filters, product grid, pagination
- [ ] Redesign `ProductDetails.jsx` - Dark gallery, specs, related products
- [ ] Redesign `Cart.jsx` - Dark cart items, summary
- [ ] Redesign `Checkout.jsx` - Dark forms, steps, payment

### Step 4: Pages - Auth & Account
- [ ] Redesign `Login.jsx` - Dark auth forms
- [ ] Redesign `Wishlist.jsx` - Dark wishlist grid
- [ ] Redesign `Profile.jsx` - Dark profile dashboard
- [ ] Redesign `MyOrders.jsx` - Dark order cards with status
- [ ] Redesign `TrackOrder.jsx` - Dark tracking timeline

## Design System Applied
- Backgrounds: `#0A0A0A`, `#0F0F0F`, `#141414`, `#1A1A1C`, `#1E1E22`
- Accents: Gold `#D4A853`, Rose Gold `#D4A5A5`
- Text: White primary, `#E8E8E8` secondary, `#9CA3AF` muted
- Components: `nayamo-btn-primary`, `nayamo-card`, `nayamo-input`, `nayamo-glass`
- Effects: Glassmorphism, glow, shimmer, smooth animations
