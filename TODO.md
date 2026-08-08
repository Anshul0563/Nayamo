# Task: Redesign Product Reviews section (client)

## Steps
- [x] Analyze existing review flow (backend + client + admin)
- [x] Plan approved by user
- [x] Create `StarRating.jsx` (fractional golden stars)
- [x] Create `RatingBreakdown.jsx` (dynamic progress rows)
- [x] Create `ReviewSummary.jsx` (3-column summary + Write Review button)
- [x] Create `ReviewMedia.jsx` (customer photos & videos strip)
- [x] Create `ReviewSort.jsx` (functional, accessible dropdown)
- [x] Create `ReviewCard.jsx` (premium card)
- [x] Create `ReviewForm.jsx` (reuse existing submission logic)
- [x] Create `ProductReviews.jsx` (orchestrator: fetch, sort, pagination, skeleton/empty/error)
- [x] Edit `ProductDetails.jsx` to render `<ProductReviews />` and remove inline section
- [x] Run ESLint on changed files
- [x] Verify build

## API/Integration Fix
- [x] Diagnosed 404 on `/api/v1/reviews/product/:id/stats`
- [x] Root cause: deployed backend (`nayamo.onrender.com`) runs an older build missing `getProductReviewStats` route
- [x] `ProductReviews.jsx` now gracefully falls back to the working `/product/:id` reviews response (which carries `stats.avgRating`/`total`) and derives per-star counts + average client-side when per-star counts aren't available
- [x] Verified build compiles + ESLint clean
