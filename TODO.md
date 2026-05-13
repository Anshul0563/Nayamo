# TODO: Production-harden forgot-password + reset-password (MERN)

## Step 1 — Gather context (already done)
- Read frontend forgot/reset pages, AuthContext, api client.
- Read backend auth controller, auth routes, email service, env, user model, server.

## Step 2 — Plan (need approval)
- Fix frontend payload mismatch for forgot-password (Login.jsx + AuthContext usage if needed).
- Ensure forgot-reset token extraction is correct (ResetPassword.jsx already extracts token from query param).
- Harden frontend UX + validation and prevent duplicate requests.
- Harden backend: ensure password reset token is correctly hashed + validated, and refresh token revocation is correct.
- Ensure rate limiting and generic messaging; add missing protection against user enumeration and slow SMTP.

## Step 3 — Implement code changes (after approval)
- Edit client/src/pages/Login.jsx to send {email} object to forgotPassword.
- Verify/adjust client/src/pages/ForgotPassword.jsx and AuthContext forgotPassword signature.
- Improve ResetPassword.jsx UX: loading, error handling, success state.
- Edit backend/controllers/authController.js: enforce strong validation, ensure refresh token revocation correctly; avoid double responses; remove sensitive logs.
- Edit backend/services/emailService.js: ensure transporter pool settings safe; add timeouts.
- Edit backend/routes/authRoutes.js/server.js if needed for correct limiter paths.

## Step 4 — Testing
- Run backend unit/integration tests if any.
- Run manual flow tests: request reset, open link, reset password, login.
- Verify no 400/401 from payload mismatch.

## Step 5 — Deliverables
- Summarize each issue: explanation, root cause, production/security impact, and provide complete corrected code blocks.

