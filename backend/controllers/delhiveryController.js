const api = require("../utils/axiosInstance");
const asyncHandler = require("../utils/asyncHandler");

// Generate Waybill
exports.generateWaybill = asyncHandler(async (req, res) => {
  const response = await api.get("/api/v1/packages/json/?token=" + process.env.DELHIVERY_TOKEN);
  res.json({
    success: true,
    data: response.data,
  });
});

// Create Shipment
exports.createShipment = asyncHandler(async (req, res) => {
  const { name, address, pin, city, state, phone, orderId, paymentMode, amount } = req.body;

  // Validation
  if (!name || !address || !pin || !city || !state || !phone) {
    res.status(400);
    throw new Error("All shipping details are required");
  }

  const shipmentData = {
    shipments: [{
      name: name.trim(),
      add: address.trim(),
      pin: pin.trim(),
      city: city.trim(),
      state: state.trim(),
      country: "India",
      phone: phone.trim(),
      order: orderId,
      payment_mode: paymentMode || "Prepaid",
      total_amount: amount,
      quantity: "1",
      weight: "0.5"
    }],
    pickup_location: {
      name: "Nayamo Warehouse"
    }
  };

  const response = await api.post("/api/cmu/create.json", shipmentData);
  res.json({
    success: true,
    data: response.data,
  });
});

// Track Shipment
exports.trackShipment = asyncHandler(async (req, res) => {
  const { waybill } = req.params;

  if (!waybill) {
    res.status(400);
    throw new Error("Waybill number is required");
  }

  const response = await api.get(`/api/v1/packages/json/?waybill=${waybill}&token=${process.env.DELHIVERY_TOKEN}`);
  res.json({
    success: true,
    data: response.data,
  });
});

// Cancel Shipment
exports.cancelShipment = asyncHandler(async (req, res) => {
  const { waybill } = req.body;

  if (!waybill) {
    res.status(400);
    throw new Error("Waybill number is required");
  }

  const response = await api.post("/api/p/edit", {
    waybill,
    cancellation: true
  });

  res.json({
    success: true,
    data: response.data,
  });
});
