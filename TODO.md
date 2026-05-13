# Nayamo - Implementation Tracker

## Phase A: Razorpay webhook automation + Delhivery shipment automation (approved)
- [ ] Create production-grade Razorpay webhook handler
      - verify signature using RAZORPAY_WEBHOOK_SECRET
      - handle payment.captured, payment.failed, order.paid
      - update Order: isPaid/paymentStatus/paidAt/razorpayPaymentId/razorpaySignature
      - idempotency/replay protection (store processed payment/webhook identifiers)
- [ ] Trigger Delhivery shipment creation after successful payment
      - call Delhivery createShipment with order shipping details
      - generate waybill if required by API flow
      - persist shipment fields in Order.delhivery (waybill, labelUrl, trackingUrl, courier)
      - store full Delhivery response for debugging
      - implement retry on temporary API failures
- [ ] Harden logging & error handling throughout webhook handler
- [ ] Update Delhivery controller only as needed to support DB persistence inputs/outputs
- [ ] Local testing plan + Postman checklist for webhook replay

## Phase B onwards (not started)
- [ ] Inventory refactor to payment-driven stock deduction + restore on cancel/refund
- [ ] Refund system + invoice + email automation + tracking sync
- [ ] BullMQ queues + background jobs
- [ ] Admin endpoints + security hardening + env validation

