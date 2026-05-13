# Delhivery Feature - Implementation Checklist

## 1) Repo understanding (done)
- Located Delhivery integration points:
  - `backend/controllers/delhiveryController.js`
  - `backend/services/delhiveryService.js`
  - `backend/routes/delhiveryRoutes.js`
  - `backend/controllers/shippingController.js`
  - `backend/services/orderService.js`
  - `backend/routes/shippingRoutes.js`
- Noted potential inconsistencies between controller/service payloads and routing.

## 2) Correctness fixes (planned)
- Align Delhivery API endpoints, request payload fields, and query params across `delhiveryController` and `delhiveryService`.
- Fix `paymentMethod` mapping (cod/prepaid vs COD/Prepaid) and required `waybill` usage.
- Ensure order state transitions are consistent with shipment lifecycle.
- Ensure tracking/cancel endpoints are secure (admin-only) and validated.

## 3) Persistence & audit
- Persist `labelUrl`, `createdAt`, and full tracking metadata into `order.delhivery`.
- Add/ensure indexes on `delhivery.waybill` already present.

## 4) Frontend integration (if required)
- Verify there are endpoints/UI calls for creating shipment and tracking.

## 5) Testing & verification
- Add/extend tests for:
  - shipment creation idempotency
  - tracking retrieval
  - cancel shipment validation
- Run lint/test/build.

