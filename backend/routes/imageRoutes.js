const express = require("express");
const router = express.Router();
const axios = require("axios");
const logger = require("../config/logger");

// Image proxy to handle CORS issues with external images
router.get("/proxy", async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({
        success: false,
        message: "URL parameter is required"
      });
    }

    // Validate URL format
    let parsedUrl;
    try {
      parsedUrl = new URL(url);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Invalid URL format"
      });
    }

    // Only allow specific domains for security
    const allowedDomains = [
      'images.unsplash.com',
      'unsplash.com',
      'picsum.photos',
      'via.placeholder.com'
    ];

    if (!allowedDomains.some(domain => parsedUrl.hostname.includes(domain))) {
      return res.status(403).json({
        success: false,
        message: "Domain not allowed"
      });
    }

    // Fetch the image
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 10000, // 10 second timeout
      headers: {
        'User-Agent': 'Nayamo-Image-Proxy/1.0'
      }
    });

    // Set appropriate headers
    res.set({
      'Content-Type': response.headers['content-type'] || 'image/jpeg',
      'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type'
    });

    // Send the image data
    res.send(Buffer.from(response.data));

  } catch (error) {
    logger.error('Image proxy error:', error.message);

    if (error.response) {
      // External service error
      return res.status(error.response.status).json({
        success: false,
        message: `External service error: ${error.response.status}`
      });
    }

    // Internal error
    res.status(500).json({
      success: false,
      message: "Failed to fetch image"
    });
  }
});

module.exports = router;