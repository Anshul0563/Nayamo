const axios = require("axios");

const api = axios.create({
  baseURL: process.env.DELHIVERY_BASE_URL,
  headers: {
    Authorization: `Token ${process.env.DELHIVERY_TOKEN}`,
    "Content-Type": "application/json"
  }
});

module.exports = api;