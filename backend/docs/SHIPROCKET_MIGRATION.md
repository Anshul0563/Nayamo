# Nayamo shipping migration

## Original architecture

The admin Orders page called `POST /api/v1/shipping/create/:id`. The backend called
`delhiveryService.createShipment`, stored the result under `order.delhivery`, and
advanced the order to `pickup_requested`. Legacy Delhivery fields, routes, and
webhook handling remain in place for historical orders and are not used by the
active forward-shipment workflow.

## New lifecycle

1. Admin calls the existing authenticated shipment endpoint.
2. An atomic order update claims creation, preventing concurrent duplicate calls.
3. The backend validates the stored checkout address, payment state, total, and items.
4. Shiprocket creates the order; its IDs are persisted immediately.
5. The backend assigns an AWB, requests pickup, and generates a label when each step succeeds.
6. AWB, courier, label, tracking URL, provider status, and webhook events are stored under `order.shiprocket`.
7. `POST /api/v1/webhook/status` accepts authenticated, idempotent tracking updates.

Creation states are durable: `creating`, `created`, `failed`, and
`reconciliation_required`. Ambiguous network failures are never automatically
retried. An admin may use `POST /api/v1/shipping/recover/:id` with
`{"confirmNoProviderOrder":true}` only after checking the Shiprocket panel/API
for the attempt reference and confirming that no provider order exists.

## API endpoints

All shipment-management routes require the existing JWT and admin middleware.

- `POST /api/v1/shipping/create/:id` — create a Shiprocket shipment.
- `POST /api/v1/shipping/bulk` — create shipments for `{ "orderIds": ["..."] }`.
- `POST /api/v1/shipping/request-pickup/:id` — retry/schedule pickup.
- `POST /api/v1/shipping/assign-awb/:id` — retry courier/AWB assignment.
- `POST /api/v1/shipping/recover/:id` — manually clear an interrupted/ambiguous
  creation after provider verification.
- `POST /api/v1/shipping/cancel/:id` — cancel a provider shipment when its
  current Shiprocket state permits it; this does not perform a refund.
- `GET /api/v1/shipping/label/:id` — return `{ waybill, courier, labelUrl }`.
- `GET /api/v1/shipping/track/:id` — refresh tracking by AWB.
- `POST /api/v1/webhook/status` — provider callback; configure `x-api-key` to match
  `SHIPROCKET_WEBHOOK_TOKEN`.

Example successful response (sanitized):

```json
{ "success": true, "message": "Shiprocket shipment created successfully", "data": {
  "shiprocket": { "orderId": "123", "shipmentId": "456", "awb": "789", "courier": "Courier" }
} }
```

## Deployment

In Render, add the Shiprocket variables from `.env.example` to the backend service:
`SHIPROCKET_EMAIL`, `SHIPROCKET_PASSWORD`, `SHIPROCKET_PICKUP_LOCATION`,
`SHIPROCKET_PICKUP_PINCODE`, and a strong `SHIPROCKET_WEBHOOK_TOKEN`. Keep the
credentials backend-only. Set the webhook URL to
`https://<backend-domain>/api/v1/webhook/status`, then deploy the backend and test
with a non-production/test Shiprocket account or a deliberately selected test order.

No Vercel environment variable is required: the admin continues to call the same
backend endpoint. Redeploy the admin only if its deployment pipeline requires it.

After a successful end-to-end test, remove the obsolete Delhivery credential from
Render only if no historical/manual Delhivery operation still depends on it.

## Data compatibility and limitations

`order.delhivery` is not migrated or deleted. New forward shipments use
`order.shiprocket`; old Delhivery tracking remains readable. The current checkout
stores the structured address as a legacy string, so the adapter validates and
parses its existing `Name, address, city, state - PIN` format. New Shiprocket
orders now use Shiprocket's documented reverse-order endpoint and store reverse
IDs under `returnShipment`; historical Delhivery returns remain preserved and
require manual carrier confirmation for pickup.

The webhook uses Shiprocket's documented shared `x-api-key` mechanism. Because
the provider does not document an HMAC signature for this callback, the endpoint
fails closed without the configured token, validates shipment identity, records
events, and prevents terminal-status regression. Rotate all credentials manually
if repository history or an archive ever contained real secrets; removing a file
from the working tree does not remove it from Git history.
