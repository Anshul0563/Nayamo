# TODO - Checkout/Order/Payment MERN Fix

## Plan-approved steps

- ✅ Approved

1. Update frontend `Checkout.jsx`:
   - Add stable `idempotencyKey` per click for COD and online
   - Pass it to `orderAPI.placeOrder`
   - Stop trusting frontend amount for online (backend will recompute)
   - Fix Razorpay loading/early-return behavior
   - Add required debug logs for payload, headers, token state

2. Backend auth debugging:
   - Add deep logs in `backend/middleware/authMiddleware.js` for `req.headers.authorization`, decoded payload (safe), and `req.user`

3. Tighten order idempotency:
   - Update `backend/services/orderService.js` so duplicate `idempotencyKey` reliably returns the existing order and does not double-clear cart

4. Backend payment flow fixes:
   - Update `backend/controllers/paymentController.js` to recompute payable amount from the created Mongo Order
   - Ignore/stop validating client-sent `amount`
   - Ensure idempotent Razorpay order creation for the same Mongo Order

5. Add deep debugging logs in:
   - `backend/controllers/orderController.js`
   - `backend/services/orderService.js`
   - `backend/controllers/paymentController.js`

6. Verify end-to-end:
   - COD works once, cart clears once
   - Online creates order + Razorpay order, verifies signature, marks paid, redirects
   - Duplicate clicks / duplicate payment verification do not create duplicates

