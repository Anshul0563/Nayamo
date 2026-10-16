jest.mock("../models/Order", () => ({ findOne: jest.fn() }));
jest.mock("../config/env", () => ({
  getShiprocketWebhookToken: jest.fn(() => process.env.SHIPROCKET_WEBHOOK_TOKEN),
  isConfigured: jest.fn((value) => Boolean(value && value !== "TBD")),
}));

const Order = require("../models/Order");
const { handleShiprocketWebhook } = require("../controllers/webhookController");

const invoke = async (body, headers = {}) => {
  const response = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  const next = jest.fn();
  handleShiprocketWebhook({ body, headers }, response, next);
  await new Promise((resolve) => setImmediate(resolve));
  return { response, next };
};

describe("Shiprocket webhook security and state handling", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.SHIPROCKET_WEBHOOK_TOKEN = "webhook-secret";
  });

  it("fails closed when webhook authentication is missing", async () => {
    delete process.env.SHIPROCKET_WEBHOOK_TOKEN;
    const { response } = await invoke({ awb: "AWB1", current_status: "IN TRANSIT" });
    expect(response.status).toHaveBeenCalledWith(503);
    expect(Order.findOne).not.toHaveBeenCalled();
  });

  it("rejects invalid authentication without changing an order", async () => {
    const { response } = await invoke({ awb: "AWB1", current_status: "IN TRANSIT" }, { "x-api-key": "wrong" });
    expect(response.status).toHaveBeenCalledWith(401);
    expect(Order.findOne).not.toHaveBeenCalled();
  });

  it("records a valid event but does not regress a delivered order", async () => {
    const order = {
      status: "delivered",
      shiprocket: { awb: "AWB1", events: [] },
      save: jest.fn().mockResolvedValue(undefined),
    };
    Order.findOne.mockResolvedValue(order);
    const { response } = await invoke(
      { awb: "AWB1", current_status: "IN TRANSIT", current_timestamp: "2026-10-11 10:00:00" },
      { "x-api-key": "webhook-secret" },
    );
    expect(response.json).toHaveBeenCalledWith({ success: true, message: "Processed" });
    expect(order.status).toBe("delivered");
    expect(order.save).toHaveBeenCalledTimes(1);
  });

  it("ignores a duplicate event", async () => {
    const order = {
      status: "in_transit",
      shiprocket: { awb: "AWB1", events: [{ key: "IN TRANSIT:stamp" }] },
      save: jest.fn(),
    };
    Order.findOne.mockResolvedValue(order);
    const { response } = await invoke(
      { awb: "AWB1", current_status: "IN TRANSIT", current_timestamp: "stamp" },
      { "x-api-key": "webhook-secret" },
    );
    expect(response.json).toHaveBeenCalledWith({ success: true, message: "Duplicate event ignored" });
    expect(order.save).not.toHaveBeenCalled();
  });
});
