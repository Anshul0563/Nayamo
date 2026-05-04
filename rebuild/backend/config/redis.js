const Redis = require("ioredis");

let redis = null;

try {
  if (process.env.REDIS_URL) {
    redis = new Redis(process.env.REDIS_URL, {
      lazyConnect: true,
      maxRetriesPerRequest: 3,
    });

    redis.on("connect", () => {
      console.log("✅ Redis connected");
    });

    redis.on("error", (err) => {
      console.warn("⚠️ Redis error:", err.message);
    });
  } else {
    console.warn("⚠️ Redis URL not provided - caching disabled");
  }
} catch (error) {
  console.warn("⚠️ Redis unavailable:", error.message);
}

const getRedis = () => redis;

module.exports = getRedis;

