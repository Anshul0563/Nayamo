const axios =
  require("axios");

// =========================
// AXIOS CLIENT
// =========================
const api =
  axios.create({
    baseURL:
      process.env
        .DELHIVERY_BASE_URL,

    headers: {
      Authorization: `Token ${process.env.DELHIVERY_TOKEN}`,

      "Content-Type":
        "application/json",
    },
  });

// =========================
// CREATE SHIPMENT
// =========================
exports.createShipment =
  async (order) => {
    try {
      const payload = {
        shipments: [
          {
            name:
              order.user?.name ||
              "Customer",

            add:
              order.address,

            pin: "110001",

            city: "Delhi",

            state: "Delhi",

            country:
              "India",

            phone:
              order.phone,

            order:
              order._id.toString(),

            payment_mode:
              order.paymentMethod ===
              "cod"
                ? "COD"
                : "Prepaid",

            total_amount:
              order.totalPrice,

            quantity:
              order.items.length,

            waybill: "",

            shipment_width: 10,

            shipment_height: 10,

            weight: 0.5,
          },
        ],
      };

      const response =
        await api.post(
          "/cmu/create.json",
          payload
        );

      const packageData =
        response.data
          ?.packages?.[0];

      return {
        waybill:
          packageData
            ?.waybill ||

          "NO_WAYBILL",

        trackingUrl: `https://www.delhivery.com/track/package/${
          packageData
            ?.waybill
        }`,
      };
    } catch (err) {
      console.error(
        "[DELHIVERY ERROR]",
        err.response?.data ||
          err.message
      );

      throw new Error(
        "Shipment creation failed"
      );
    }
  };

// =========================
// TRACK SHIPMENT
// =========================
exports.trackShipment =
  async (waybill) => {
    try {
      const response =
        await api.get(
          `/v1/packages/json/?waybill=${waybill}`
        );

      return response.data;
    } catch (err) {
      console.error(
        "[TRACK ERROR]",
        err.response?.data ||
          err.message
      );

      throw new Error(
        "Tracking failed"
      );
    }
  };