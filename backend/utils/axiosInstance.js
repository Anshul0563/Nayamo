const axios = require("axios");
const { getDelhiveryBaseUrl, getDelhiveryToken } = require("../config/env");

const delhiveryToken = getDelhiveryToken();

const api = axios.create({
  baseURL: getDelhiveryBaseUrl(),
  headers: {
    ...(delhiveryToken ? { Authorization: `Token ${delhiveryToken}` } : {}),
    "Content-Type": "application/json"
  }
});

module.exports = api;
