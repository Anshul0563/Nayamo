const api = require("../utils/axiosInstance");

// Generate Waybill
exports.generateWaybill = async (req, res) => {
  try {
    const response = await api.get("/api/v1/packages/json/?token=" + process.env.DELHIVERY_TOKEN);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create Shipment
exports.createShipment = async (req, res) => {
  try {
    const shipmentData = {
      shipments: [{
        name: req.body.name,
        add: req.body.address,
        pin: req.body.pin,
        city: req.body.city,
        state: req.body.state,
        country: "India",
        phone: req.body.phone,
        order: req.body.orderId,
        payment_mode: req.body.paymentMode,
        total_amount: req.body.amount,
        quantity: "1",
        weight: "0.5"
      }],
      pickup_location: {
        name: "Nayamo Warehouse"
      }
    };

    const response = await api.post("/api/cmu/create.json", shipmentData);
    res.json(response.data);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Track Order
exports.trackShipment = async (req, res) => {
  try {
    const { waybill } = req.params;
    const response = await api.get(`/api/v1/packages/json/?waybill=${waybill}&token=${process.env.DELHIVERY_TOKEN}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cancel Order
exports.cancelShipment = async (req, res) => {
  try {
    const response = await api.post("/api/p/edit", {
      waybill: req.body.waybill,
      cancellation: true
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};