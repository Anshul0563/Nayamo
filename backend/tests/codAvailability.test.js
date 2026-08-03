jest.mock("../models/Settings", () => ({
  getSingleton: jest.fn(),
}));

jest.mock("../models/Cart", () => ({
  findOne: jest.fn(),
}));

jest.mock("../models/Order", () => ({
  create: jest.fn(),
}));

jest.mock("../models/Product", () => ({
  findById: jest.fn(),
}));

jest.mock("../config/logger", () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

jest.mock("../services/notificationService", () => ({
  emitOrderNotification: jest.fn(),
  emitInventoryNotification: jest.fn(),
}));

const Settings = require("../models/Settings");
const Cart = require("../models/Cart");
const { getPaymentOptions } = require("../controllers/settingsController");
const { placeOrder } = require("../services/orderService");

const waitForAsyncHandler = () => new Promise(setImmediate);

describe("COD availability", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("public payment options", () => {
    const getResponse = async () => {
      const res = { json: jest.fn() };
      const next = jest.fn();

      getPaymentOptions({}, res, next);
      await waitForAsyncHandler();

      return { res, next };
    };

    it("returns COD as unavailable when an admin has disabled it", async () => {
      Settings.getSingleton.mockResolvedValue({ codEnabled: false });

      const { res, next } = await getResponse();

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { codEnabled: false },
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("keeps COD available for settings documents created before the toggle", async () => {
      Settings.getSingleton.mockResolvedValue({});

      const { res } = await getResponse();

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { codEnabled: true },
      });
    });
  });

  it("rejects an attempted COD order before reading the cart when COD is disabled", async () => {
    Settings.getSingleton.mockResolvedValue({ codEnabled: false });

    await expect(
      placeOrder("user-id", {
        address: "1 Test Street",
        phone: "9876543210",
        paymentMethod: "cod",
      }),
    ).rejects.toMatchObject({
      message: "COD is not available at your region",
      statusCode: 409,
    });

    expect(Cart.findOne).not.toHaveBeenCalled();
  });
});
