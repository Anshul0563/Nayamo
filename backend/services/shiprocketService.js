const axios = require("axios");
const {
  getShiprocketBaseUrl,
  getShiprocketEmail,
  getShiprocketPassword,
  getShiprocketPickupLocation,
  getShiprocketPickupPincode,
  getShiprocketReturnSeller,
  isConfigured,
} = require("../config/env");

const TOKEN_TTL_MS = 9 * 24 * 60 * 60 * 1000;
let tokenCache = { value: null, expiresAt: 0 };

const api = () => axios.create({ baseURL: getShiprocketBaseUrl(), timeout: 20000 });

const publicError = (error, fallback) => {
  const result = new Error(fallback);
  result.statusCode = error?.response?.status === 401 ? 503 : 502;
  result.ambiguous = !error?.response || error?.code === "ECONNABORTED" || error?.code === "ETIMEDOUT";
  return result;
};

async function authenticate(force = false) {
  if (!force && tokenCache.value && tokenCache.expiresAt > Date.now()) return tokenCache.value;
  if (!isConfigured(getShiprocketEmail()) || !isConfigured(getShiprocketPassword())) {
    const error = new Error("Shiprocket is not configured");
    error.statusCode = 503;
    throw error;
  }
  try {
    const response = await api().post("/auth/login", {
      email: getShiprocketEmail(),
      password: getShiprocketPassword(),
    });
    const token = response.data?.token;
    if (!token) throw new Error("Shiprocket authentication returned no token");
    tokenCache = { value: token, expiresAt: Date.now() + TOKEN_TTL_MS };
    return token;
  } catch (error) {
    throw publicError(error, "Shiprocket authentication failed");
  }
}

async function request(method, path, data) {
  let token = await authenticate();
  try {
    return (await api().request({ method, url: path, ...(method.toLowerCase() === "get" ? { params: data } : { data }), headers: { Authorization: `Bearer ${token}` } })).data;
  } catch (error) {
    if (error?.response?.status === 401) {
      token = await authenticate(true);
      try {
        return (await api().request({ method, url: path, ...(method.toLowerCase() === "get" ? { params: data } : { data }), headers: { Authorization: `Bearer ${token}` } })).data;
      } catch (retryError) {
        throw publicError(retryError, "Shiprocket request failed");
      }
    }
    throw publicError(error, "Shiprocket request failed");
  }
}

const number = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const packageConfig = () => {
  const values = [
    Number(process.env.SHIPROCKET_PACKAGE_LENGTH_CM),
    Number(process.env.SHIPROCKET_PACKAGE_BREADTH_CM),
    Number(process.env.SHIPROCKET_PACKAGE_HEIGHT_CM),
    Number(process.env.SHIPROCKET_PACKAGE_WEIGHT_KG),
  ];
  if (values.some((value) => !Number.isFinite(value) || value <= 0)) {
    const error = new Error("Shiprocket package dimensions and weight are not configured");
    error.statusCode = 503;
    throw error;
  }
  return { length: values[0], breadth: values[1], height: values[2], weight: values[3] };
};

function parseAddress(order) {
  const raw = order?.shippingAddress || order?.address;
  if (raw && typeof raw === "object") {
    return {
      name: raw.name || order.user?.name || "Customer",
      address: raw.address || raw.addressLine1,
      address2: raw.addressLine2 || "",
      city: raw.city,
      state: raw.state,
      pincode: String(raw.pincode || raw.pin || raw.postalCode || ""),
      country: raw.country || "India",
    };
  }
  const text = String(raw || "").trim();
  const match = text.match(/^(.*?),\s*(.*?),\s*([^,]+),\s*([^,]+?)\s*-\s*(\d{6})$/);
  if (!match) {
    const error = new Error("Order address must include name, address, city, state, and a 6-digit PIN code");
    error.statusCode = 400;
    throw error;
  }
  return { name: match[1], address: match[2], address2: "", city: match[3], state: match[4], pincode: match[5], country: "India" };
}

function buildItems(order) {
  return (order.items || []).map((item, index) => {
    const product = item.product && typeof item.product === "object" ? item.product : {};
    const name = product.title || item.name || `Nayamo item ${index + 1}`;
    return {
      name: String(name).slice(0, 100),
      sku: String(product.sku || product._id || item.product || `NAYAMO-${index + 1}`).slice(0, 50),
      units: Math.max(1, number(item.quantity, 1)),
      selling_price: number(item.price),
    };
  });
}

function validatePayment(order) {
  const total = number(order.totalPrice);
  const method = String(order.paymentMethod || "").toLowerCase();
  if (total <= 0) throw new Error("Shipment requires a positive order total");
  if (method === "cod") return { payment_method: "COD", cod: 1, total };
  if (method !== "online" || order.paymentStatus !== "paid" || order.isPaid !== true) {
    const error = new Error("Online order must be paid before shipment creation");
    error.statusCode = 409;
    throw error;
  }
  return { payment_method: "Prepaid", cod: 0, total };
}

exports.createOrder = async (order) => {
  if (!order?._id) throw new Error("Order is required");
  const address = parseAddress(order);
  if (!/^\d{6}$/.test(address.pincode)) throw new Error("A valid 6-digit delivery PIN code is required");
  if (!/^\d{10}$/.test(String(order.phone || ""))) throw new Error("A valid 10-digit phone number is required");
  if (!isConfigured(getShiprocketPickupLocation()) || !/^\d{6}$/.test(String(getShiprocketPickupPincode() || ""))) {
    const error = new Error("Shiprocket pickup location and pickup PIN code are not configured");
    error.statusCode = 503;
    throw error;
  }
  const payment = validatePayment(order);
  const items = buildItems(order);
  if (!items.length) throw new Error("Order has no shippable items");
  const parcel = packageConfig();
  return request("post", "/orders/create/adhoc", {
    order_id: `NAYAMO-${String(order._id).replace(/[^a-zA-Z0-9]/g, "").slice(-13)}`,
    order_date: new Date(order.createdAt || Date.now()).toISOString().slice(0, 10),
    pickup_location: getShiprocketPickupLocation(),
    billing_customer_name: address.name,
    billing_last_name: "",
    billing_address: address.address,
    billing_address_2: address.address2,
    billing_city: address.city,
    billing_pincode: address.pincode,
    billing_state: address.state,
    billing_country: address.country,
    billing_email: order.user?.email || "support@nayamo.in",
    billing_phone: String(order.phone),
    shipping_is_billing: true,
    order_items: items,
    payment_method: payment.payment_method,
    sub_total: payment.total,
    cod_amount: payment.cod ? payment.total : 0,
    ...parcel,
  });
};

exports.createReturnOrder = async (order) => {
  if (!order?._id) throw new Error("Order is required");
  const buyer = parseAddress(order);
  const seller = getShiprocketReturnSeller();
  if (!seller.name || !seller.address || !seller.city || !seller.state || !/^\d{6}$/.test(String(seller.pincode || "")) || !/^\d{10}$/.test(String(seller.phone || ""))) {
    const error = new Error("Shiprocket return seller address is not configured");
    error.statusCode = 503;
    throw error;
  }
  const items = buildItems(order);
  if (!items.length) throw new Error("Order has no returnable items");
  const parcel = packageConfig();
  const response = await request("post", "/orders/create/return", {
    order_id: `NAYAMO-RET-${String(order._id).replace(/[^a-zA-Z0-9]/g, "").slice(-16)}`,
    order_id_original: order.shiprocket?.orderId,
    order_date: new Date().toISOString().slice(0, 10),
    pickup_customer_name: buyer.name,
    pickup_address: buyer.address,
    pickup_city: buyer.city,
    pickup_pincode: buyer.pincode,
    pickup_state: buyer.state,
    pickup_country: buyer.country,
    pickup_email: order.user?.email || "support@nayamo.in",
    pickup_phone: String(order.phone),
    shipping_customer_name: seller.name,
    shipping_address: seller.address,
    shipping_city: seller.city,
    shipping_pincode: seller.pincode,
    shipping_state: seller.state,
    shipping_country: seller.country,
    shipping_phone: seller.phone,
    shipping_email: seller.email,
    order_items: items,
    payment_method: "Prepaid",
    sub_total: number(order.totalPrice),
    ...parcel,
  });
  return response;
};

exports.assignAwb = (shipmentId) => request("post", "/courier/assign/awb", { shipment_id: Number(shipmentId) });
exports.assignReturnAwb = (shipmentId) => request("post", "/courier/assign/awb", { shipment_id: Number(shipmentId), is_return: 1 });
exports.requestPickup = (shipmentId) => request("post", "/courier/generate/pickup", { shipment_id: [Number(shipmentId)] });
exports.generateLabel = (shipmentId) => request("post", "/courier/generate/label", { shipment_id: [Number(shipmentId)] });
exports.trackShipment = (awb) => request("get", `/courier/track/awb/${encodeURIComponent(awb)}`);
exports.cancelOrder = (orderId) => request("post", "/orders/cancel", { ids: [String(orderId)] });

exports.extractShipment = (response) => ({
  orderId: response?.order_id || response?.id,
  shipmentId: response?.shipment_id || response?.shipment_id,
});
exports.extractAwb = (response) => ({
  awb: response?.response?.data?.awb_code || response?.awb_code || response?.awb,
  courier: response?.response?.data?.courier_name || response?.courier_name,
});
exports.resetTokenCache = () => { tokenCache = { value: null, expiresAt: 0 }; };
