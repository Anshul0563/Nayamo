# Nayamo - Luxury Jewellery E-commerce (Rebuilt)

Clean rebuild with Vite + Fixed Tailwind + Production-ready.

## 🚀 Quick Start

```bash
# Clone & Install
git clone <repo>
cd rebuild
npm install:all

# Backend (with admin seed)
cd backend
cp .env.example .env  # Add MONGO_URI, JWT_SECRET, etc.
npm run dev  # http://localhost:5000
npm run seed:admin

# Client
cd ../client
npm run dev  # http://localhost:5173

# Admin
cd ../admin
npm run dev  # http://localhost:5174
```

## 📁 Structure
```
rebuild/
├── backend/     # Express + MongoDB API
├── client/      # Customer frontend (Vite)
├── admin/       # Admin dashboard (Vite)
└── package.json # Workspaces
```

## 🛠️ Features (EXACT same as original)
- Customer: Browse/Add Cart/Wishlist/Orders/Razorpay/Reviews
- Admin: Dashboard/Analytics/CRUD/Payments/Returns/Realtime
- Optional: Razorpay/Delhivery/Redis (graceful fallback)

## 🌐 Deploy
**Frontend (Vercel):**
```
client/ → vercel --prod
admin/ → vercel --prod (Nayamo Admin)
```

**Backend (Render):**
```
backend/ → Render (Node) + MongoDB Atlas
```

## .env Required
```
MONGO_URI=mongodb+srv://...
JWT_SECRET=your-secret
CLOUDINARY_*=...
RAZORPAY_*=... 
DELHIVERY_*=... 
```

## Scripts
```bash
npm run dev:all     # All apps
npm run build:all   # Production builds
npm run seed:admin  # Create admin user
```

