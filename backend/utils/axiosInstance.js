const axios = require("axios");
const logger = require("../config/logger");

const {
  getDelhiveryToken,
  getDelhiveryBaseUrl,
} = require("../config/env");

const api = axios.create({
  baseURL: getDelhiveryBaseUrl(),
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Token ${getDelhiveryToken()}`,
  },
});

api.interceptors.request.use((config) => {
  logger.info(
    `DELHIVERY API => ${config.method?.toUpperCase()} ${config.url}`
  );

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    logger.error(
      `DELHIVERY ERROR => ${
        error.response?.data
          ? JSON.stringify(error.response.data)
          : error.message
      }`
    );

    return Promise.reject(error);
  }
);

module.exports = api;