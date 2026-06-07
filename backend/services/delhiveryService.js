const axios = require("axios");
const { getDelhiveryBaseUrl, getDelhiveryToken, isConfigured } = require("../config/env");

const getApi = () => {
  const token = getDelhiveryToken();

  if (!isConfigured(token)) {
    const error = new Error("Delhivery is not configured");
    error.statusCode = 503;
    throw error;
  }

  return axios.create({
    baseURL: getDelhiveryBaseUrl(),
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    },
    timeout: 20000,
  });
};

// =========================
// HELPERS
// =========================
function toPinFromAddress(_address) {
  // TODO:
  // Replace later with actual pincode extraction logic
  return "110001";
}

function toCityFromAddress(_address) {
  return "Delhi";
}

function toStateFromAddress(_address) {
  return "Delhi";
}

// =========================
// CREATE SHIPMENT
// =========================
exports.createShipment = async (order) => {
  if (!order) {
    throw new Error("Order is required");
  }

  try {
    const api = getApi();
    const token = getDelhiveryToken();
    const payload = {
      shipments: [
        {
          name: order.user?.name || "Customer",

          add: order.address,

          pin: toPinFromAddress(order.address),

          city: toCityFromAddress(order.address),

          state: toStateFromAddress(order.address),

          country: "India",

          phone: order.phone,

          order: order._id.toString(),

          payment_mode: order.paymentMethod === "cod" ? "COD" : "Prepaid",

          total_amount: order.totalPrice,

          quantity: Array.isArray(order.items) ? order.items.length : 1,

          waybill: "",

          // Packaging
          shipment_width: 10,
          shipment_height: 10,
          weight: 0.5,
        },
      ],
    };

    // =========================
    // API REQUEST
    // =========================
    const qs = require("querystring");

    const response = await api.post(
      "/cmu/create.json",
      qs.stringify({
        format: "json",
        data: JSON.stringify(payload),
      }),
      {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );

    // =========================
    // RESPONSE PARSING
    // =========================
    const packageData = response.data?.packages?.[0] || {};

    const waybill = packageData.waybill || "";

    if (!waybill) {
      throw new Error(
        `Delhivery returned no waybill. Response: ${JSON.stringify(
          response.data,
        ).slice(0, 1000)}`,
      );
    }

    return {
      waybill,

      trackingUrl: `https://www.delhivery.com/track/package/${waybill}`,

      labelUrl: packageData?.label_url || packageData?.labelUrl || null,
    };
  } catch (err) {
    throw new Error(
      err.response?.data?.message || err.message || "Shipment creation failed",
    );
  }
};

// =========================
// TRACK SHIPMENT
// =========================
exports.trackShipment = async (waybill) => {
  if (!waybill) {
    throw new Error("Waybill is required");
  }

  try {
    const api = getApi();
    const response = await api.get(
      `/v1/packages/json/?waybill=${encodeURIComponent(waybill)}`,
    );

    return response.data;
  } catch (err) {
    throw new Error(
      err.response?.data?.message || err.message || "Tracking failed",
    );
  }
};
