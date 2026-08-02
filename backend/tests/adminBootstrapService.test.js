jest.mock("../config/logger", () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

jest.mock("../models/User", () => {
  const mockFindOne = jest.fn();
  const mockConstructor = jest.fn().mockImplementation((data) => ({
    ...data,
    save: jest.fn().mockResolvedValue(true),
  }));

  mockFindOne.mockReturnValue({
    select: jest.fn().mockResolvedValue(null),
  });

  mockConstructor.findOne = mockFindOne;
  return mockConstructor;
});

describe("bootstrapAdminOnStartup", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    process.env = {
      ...originalEnv,
      BOOTSTRAP_ADMIN_ON_STARTUP: "true",
      ADMIN_EMAIL: "Admin@Example.com",
      ADMIN_PASSWORD: "StrongPassword123",
      ADMIN_NAME: "System Admin",
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("returns a created result when a new admin account is bootstrapped", async () => {
    const User = require("../models/User");
    User.findOne.mockReturnValue({
      select: jest.fn().mockResolvedValue(null),
    });

    const { bootstrapAdminOnStartup } = require("../services/adminBootstrapService");
    const result = await bootstrapAdminOnStartup();

    expect(result).toMatchObject({ action: "created" });
    expect(User.findOne).toHaveBeenCalledWith({ email: "admin@example.com" });
  });
});
