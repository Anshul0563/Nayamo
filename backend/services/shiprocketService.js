const axios = require("axios");

const BASE_URL = "https://apiv2.shiprocket.in/v1/external";

let shiprocketToken = null;
let tokenExpireTime = null;

// LOGIN TOKEN
const getShiprocketToken = async () => {
  try {
    if (
      shiprocketToken &&
      tokenExpireTime &&
      Date.now() < tokenExpireTime
    ) {
      return shiprocketToken;
    }

    const res = await axios.post(
      `${BASE_URL}/auth/login`,
      {
        email: process.env.SHIPROCKET_EMAIL,
        password: process.env.SHIPROCKET_PASSWORD,
      }
    );

    shiprocketToken = res.data.token;

    // 9 hours cache
    tokenExpireTime =
      Date.now() + 9 * 60 * 60 * 1000;

    return shiprocketToken;
  } catch (error) {
    throw new Error(
      "Shiprocket Login Failed"
    );
  }
};

// CREATE SHIPMENT
const createShipment = async (
  order
) => {
  try {
    const token =
      await getShiprocketToken();

    const payload = {
      order_id: order._id.toString(),
      order_date: new Date()
        .toISOString()
        .split("T")[0],

      pickup_location: "Primary",

      billing_customer_name:
        order.user?.name || "Customer",

      billing_last_name: "",

      billing_address:
        order.address,

      billing_city: "Delhi",
      billing_pincode: "110001",
      billing_state: "Delhi",
      billing_country: "India",

      billing_email:
        order.user?.email ||
        "test@test.com",

      billing_phone:
        order.phone,

      shipping_is_billing: true,

      order_items:
        order.items.map((item) => ({
          name:
            item.product?.title ||
            "Product",
          sku:
            item.product?._id?.toString() ||
            "SKU1",
          units:
            item.quantity,
          selling_price:
            item.product?.price || 0,
        })),

      payment_method:
        order.paymentMethod ===
        "cod"
          ? "COD"
          : "Prepaid",

      sub_total:
        order.totalPrice,

      length: 10,
      breadth: 10,
      height: 5,
      weight: 0.5,
    };

    const res = await axios.post(
      `${BASE_URL}/orders/create/adhoc`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return res.data;
  } catch (error) {
    console.log(
      error.response?.data || error.message
    );
    throw new Error(
      "Shipment creation failed"
    );
  }
};

// GENERATE LABEL
const getLabel = async (
  shipmentId
) => {
  try {
    const token =
      await getShiprocketToken();

    const res = await axios.post(
      `${BASE_URL}/courier/generate/label`,
      {
        shipment_id: [shipmentId],
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return res.data;
  } catch {
    throw new Error(
      "Label generation failed"
    );
  }
};

module.exports = {
  createShipment,
  getLabel,
};