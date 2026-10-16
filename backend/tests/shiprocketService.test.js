jest.mock("axios", () => ({ create: jest.fn() }));
jest.mock("../config/env", () => ({
  getShiprocketBaseUrl: jest.fn(() => "https://example.test"),
  getShiprocketEmail: jest.fn(() => "api@example.test"),
  getShiprocketPassword: jest.fn(() => "secret"),
  getShiprocketPickupLocation: jest.fn(() => "Nayamo Warehouse"),
  getShiprocketPickupPincode: jest.fn(() => "110043"),
  isConfigured: jest.fn(() => true),
}));

const axios = require("axios");
const service = require("../services/shiprocketService");

const order = (overrides = {}) => ({
  _id: "507f1f77bcf86cd799439011",
  createdAt: "2026-10-11T00:00:00.000Z",
  user: { name: "Buyer", email: "buyer@example.com" },
  address: "Buyer, 12 Main Street, Delhi, Delhi - 110001",
  phone: "9876543210",
  paymentMethod: "cod",
  totalPrice: 2540,
  items: [{ product: { _id: "SKU1", title: "Gold Earrings" }, quantity: 2, price: 1270 }],
  ...overrides,
});

describe("Shiprocket service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    service.resetTokenCache();
    process.env.SHIPROCKET_PACKAGE_LENGTH_CM = "20";
    process.env.SHIPROCKET_PACKAGE_BREADTH_CM = "15";
    process.env.SHIPROCKET_PACKAGE_HEIGHT_CM = "10";
    process.env.SHIPROCKET_PACKAGE_WEIGHT_KG = "0.5";
    const client = {
      post: jest.fn().mockResolvedValue({ data: { token: "token-1" } }),
      request: jest.fn().mockResolvedValue({ data: { order_id: 101, shipment_id: 202 } }),
    };
    axios.create.mockReturnValue(client);
  });

  it("authenticates and maps a COD order to Shiprocket", async () => {
    const result = await service.createOrder(order());
    const client = axios.create.mock.results[0].value;
    const payload = client.request.mock.calls[0][0].data;
    expect(result).toEqual({ order_id: 101, shipment_id: 202 });
    expect(payload.payment_method).toBe("COD");
    expect(payload.cod_amount).toBe(2540);
    expect(payload.order_items[0]).toMatchObject({ name: "Gold Earrings", sku: "SKU1", units: 2 });
  });

  it("rejects an unpaid online order before making a shipping request", async () => {
    await expect(service.createOrder(order({ paymentMethod: "online", paymentStatus: "pending", isPaid: false })))
      .rejects.toThrow("must be paid");
    expect(axios.create).not.toHaveBeenCalled();
  });

  it("rejects an address without a delivery PIN", async () => {
    await expect(service.createOrder(order({ address: "12 Main Street, Delhi" })))
      .rejects.toThrow("address must include");
  });
});
