const mongoose = require("mongoose");

jest.mock("../config/logger", () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

describe("User password comparison", () => {
  beforeAll(() => {
    jest.resetModules();
  });

  it("accepts legacy plain-text passwords for existing users", async () => {
    const User = require("../models/User");
    const user = new User({
      name: "Legacy User",
      email: "legacy@example.com",
      password: "PlainText123!",
      role: "admin",
    });

    const isMatch = await user.comparePassword("PlainText123!");
    expect(isMatch).toBe(true);
    expect(user.password).not.toBe("PlainText123!");
  });
});
