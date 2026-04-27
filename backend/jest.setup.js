// Jest setup file
// Increase timeout for integration tests
jest.setTimeout(30000);

// Mock environment variables
process.env.NODE_ENV = "test";
process.env.PORT = "5001";
process.env.MONGO_URI = "mongodb://localhost:27017/nayamo_test";
process.env.JWT_SECRET = "test-jwt-secret-min-32-characters-long";
process.env.JWT_REFRESH_SECRET = "test-refresh-secret-min-32-chars";
process.env.CLOUDINARY_CLOUD_NAME = "test";
process.env.CLOUDINARY_API_KEY = "test";
process.env.CLOUDINARY_API_SECRET = "test";
process.env.RAZORPAY_KEY_ID = "test";
process.env.RAZORPAY_KEY_SECRET = "test";
process.env.DELHIVERY_BASE_URL = "https://test.delhivery.com";
process.env.DELHIVERY_TOKEN = "test";
process.env.REDIS_URL = "redis://localhost:6379";

// Suppress console logs in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
};
