const Redis = require("ioredis");
const logger = require("./logger");

let redis = null;

if (process.env.REDIS_URL) {
  redis = new Redis(process.env.REDIS_URL);

  redis.on("connect", () => logger.info("Redis connected"));
  redis.on("error", (err) => logger.error("Redis error:", err.message));
} else {
  logger.warn("Redis not configured. Running without Redis.");
}

module.exports = redis;