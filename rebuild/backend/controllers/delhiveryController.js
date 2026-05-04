const asyncHandler = require("../utils/asyncHandler");
const axios = require("axios");
const logger = require("../config/logger");

const DELHIVERY_BASE_URL = "https://track.delhivery.com";
const API_KEY = process.env.DELHIVERY_API_KEY;

exports.createShipment = asyncHandler(async (req, res) => {
  if (!API_KEY) {
    return res.status(503).json({
      success: false,
      message: "Delhivery service unavailable",
    });
  }

  const { name, address, pin, city, state, phone, orderId, paymentMode, amount } = req.body;

  try {
    const payload = {
      pickup_company: "Nayamo",
      pickup_person: name,
      pickup_phone: phone.trim(),
      pickup_address: address,
      pickup_city: city,
      pickup_state: state,
      pickup_pin: pin,
      delivery_company: "Customer",
      delivery_person: name,
      delivery_phone: phone.trim(),
      delivery_address: address,
      delivery_city: city,
      delivery_state: state,
      delivery_pin: pin,
      order: orderId,
      payment_mode: paymentMode || "Prepaid",
      total_duty: amount,
      total_amount: amount,
      manifest_details: {
        invoice_no: orderId,
        total_pieces: 1,
        order_weight: {
          weight: 0.5,
        },
      },
    };

    const response = await axios.post(
      `${DELHIVERY_BASE_URL}/apis/p/api/pickup.json`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          "auth-token": API_KEY,
        },
      }
    );

    logger.info(`Delhivery shipment created for order: ${orderId}`, response.data);

    res.json({
      success: true,
      data: response.data,
      awb: response.data.awb,
    });
  } catch (error) {
    logger.error("Delhivery API error:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: "Shipment creation failed",
      error: error.response?.data || error.message,
    });
  }
});

