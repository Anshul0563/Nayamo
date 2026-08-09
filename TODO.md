# Task: Integrate Cloudinary into Product Reviews media upload

## Backend
- [x] Create reusable `backend/utils/cloudinaryUpload.js` helper (`uploadBufferToCloudinary`)
- [x] Refactor `backend/controllers/reviewController.js` to use the shared helper
- [x] Preserve existing cleanup/rollback logic and folder convention

## Frontend
- [x] Fix `client/src/services/api.js` so FormData requests use browser-generated multipart boundary
- [x] Add longer timeout for review media submission

## Verification
- [x] Run backend tests (reviewImageUpload.test.js) — 4 passed
- [x] Run ESLint on changed files — clean
