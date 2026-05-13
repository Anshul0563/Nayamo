const axios = require("axios");

// =========================
// ENV VALIDATION
// =========================
if (!process.env.DELHIVERY_BASE_URL) {
  throw new Error("DELHIVERY_BASE_URL missing");
}

if (!process.env.DELHIVERY_TOKEN) {
  throw new Error("DELHIVERY_TOKEN missing");
}

// =========================
// AXIOS CLIENT
// =========================
const api = axios.create({
  baseURL: process.env.DELHIVERY_BASE_URL,
  headers: {
    Authorization: `Token ${process.env.DELHIVERY_TOKEN}`,
    "Content-Type": "application/json",
  },
});

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

          payment_mode:
            order.paymentMethod === "cod"
              ? "COD"
              : "Prepaid",

          total_amount: order.totalPrice,

          quantity: Array.isArray(order.items)
            ? order.items.length
            : 1,

          waybill: "",

          // Packaging
          shipment_width: 10,
          shipment_height: 10,
          weight: 0.5,
        },
      ],
    };

    // =========================
    // DEBUG LOGS
    // =========================
    console.log(
      "[DELHIVERY BASE URL]",
      process.env.DELHIVERY_BASE_URL
    );

    console.log(
      "[DELHIVERY FINAL URL]",
      `${process.env.DELHIVERY_BASE_URL}/cmu/create.json`
    );

    console.log(
      "[DELHIVERY PAYLOAD]",
      JSON.stringify(payload, null, 2)
    );

    // =========================
    // API REQUEST
    // =========================
    const response = await api.post(
      "/cmu/create.json",
      payload
    );

    console.log(
      "[DELHIVERY RESPONSE]",
      JSON.stringify(response.data, null, 2)
    );

    // =========================
    // RESPONSE PARSING
    // =========================
    const packageData =
      response.data?.packages?.[0] || {};

    const waybill =
      packageData.waybill || "";

    if (!waybill) {
      throw new Error(
        `Delhivery returned no waybill. Response: ${JSON.stringify(
          response.data
        ).slice(0, 1000)}`
      );
    }

    return {
      waybill,

      trackingUrl:
        `https://www.delhivery.com/track/package/${waybill}`,

      labelUrl:
        packageData?.label_url ||
        packageData?.labelUrl ||
        null,
    };
  } catch (err) {
    console.error(
      "[DELHIVERY ERROR]",
      err.response?.data || err.message
    );

    throw new Error(
      err.response?.data?.message ||
        err.message ||
        "Shipment creation failed"
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
    const response = await api.get(
      `/v1/packages/json/?waybill=${encodeURIComponent(
        waybill
      )}`
    );

    return response.data;
  } catch (err) {
    console.error(
      "[TRACK ERROR]",
      err.response?.data || err.message
    );

    throw new Error(
      err.response?.data?.message ||
        err.message ||
        "Tracking failed"
    );
  }
};