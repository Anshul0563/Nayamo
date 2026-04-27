# Client Fixes & Earring-Focused Redesign

## Critical Bugs
- [ ] ProductDetails.jsx - BROKEN JSX (missing closing divs)
- [ ] AuthContext.jsx - Calls `/auth/logout` which doesn't exist in backend
- [ ] AuthContext.jsx - Doesn't read user from localStorage on init
- [ ] App.js - Missing 404/NotFound route

## Medium Issues
- [ ] TrackOrder.jsx - Unused imports (useEffect, Truck)
- [ ] Checkout.jsx - No auth check, unauthenticated users can checkout
- [ ] Cart.jsx - Quantity + button doesn't check stock limit
- [ ] Home.jsx - Generic jewellery copy, not earring-focused
- [ ] Navbar.jsx - Generic nav labels
- [ ] Footer.jsx - Generic trust badges and copy

## Earring-Focused Redesign
- [ ] Hero: "Handcrafted Earrings" messaging
- [ ] Categories: Gold/Silver/Diamond Earrings
- [ ] Trust badges: Hypoallergenic, 925 Sterling Silver, Skin-Friendly, Nickel-Free
- [ ] Testimonials: Earring-specific reviews
- [ ] Product details: Earring-specific specs (weight, closure type, dimensions)
- [ ] Images: Earring-specific placeholder images
- [ ] Footer: Earring-focused collections and support links

