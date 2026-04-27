const api = require("../utils/axiosInstance");
const asyncHandler = require("../utils/asyncHandler");
const logger = require("../config/logger");

// Generate Waybill
exports.generateWaybill = asyncHandler(async (req, res) => {
  const response = await api.get("/api/v1/packages/json/", {
    params: { token: process.env.DELHIVERY_TOKEN }
  });
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

  // Validate PIN code (6 digits)
  if (!/^[0-9]{6}$/.test(pin)) {
    res.status(400);
    throw new Error("PIN code must be 6 digits");
  }

  // Validate phone (10 digits)
  if (!/^[0-9]{10}$/.test(phone)) {
    res.status(400);
    throw new Error("Phone must be 10 digits");
  }

  // Validate amount
  const totalAmount = Number(amount);
  if (isNaN(totalAmount) || totalAmount < 0) {
    res.status(400);
    throw new Error("Invalid amount");
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
      total_amount: totalAmount,
      quantity: "1",
      weight: "0.5"
    }],
    pickup_location: {
      name: "Nayamo Warehouse"
    }
  };

  const response = await api.post("/api/cmu/create.json", shipmentData);
  
  logger.info(`Shipment created for order: ${orderId}`);

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

  const response = await api.get("/api/v1/packages/json/", {
    params: {
      waybill,
      token: process.env.DELHIVERY_TOKEN
    }
  });
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

  logger.info(`Shipment cancelled: ${waybill}`);

  res.json({
    success: true,
    data: response.data,
  });
});
