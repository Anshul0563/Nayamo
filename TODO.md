# Task: Add photo/video upload to reviews in client panel

## Steps
- [x] Analyze existing review photo upload flow (backend + client + admin)
- [x] Backend: update uploadMiddleware.js to allow video files with signature validation
- [x] Backend: add `videos` field to models/Review.js
- [x] Backend: add video upload/cleanup in reviewController.js
- [x] Backend: update routes/reviewRoutes.js to handle video fields
- [ ] Client: add video upload UI + preview in ProductDetails.jsx
- [ ] Client: render review videos in ProductDetails.jsx review cards
- [ ] Admin: display review videos in Reviews.jsx
- [ ] Run backend tests + ESLint on changed files
