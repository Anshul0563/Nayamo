#!/bin/bash

# CORS Configuration Verification Script
# Run this to test your CORS setup

BACKEND_URL="${1:-https://nayamo.onrender.com}"
ORIGIN="${2:-https://nayamo-client.vercel.app}"

echo "🔍 CORS Verification Script"
echo "=================================="
echo "Backend: $BACKEND_URL"
echo "Origin: $ORIGIN"
echo ""

# Test 1: OPTIONS Preflight Request
echo "✅ Test 1: OPTIONS Preflight Request"
echo "---"
curl -s -X OPTIONS "$BACKEND_URL/api/v1/auth/login" \
  -H "Origin: $ORIGIN" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization" \
  -w "\nHTTP Status: %{http_code}\n" | head -20

echo ""
echo "✅ Test 2: Health Check"
echo "---"
curl -s "$BACKEND_URL/health" | jq .

echo ""
echo "✅ Test 3: CORS Header Response"
echo "---"
curl -s -I "$BACKEND_URL/api/v1/products" \
  -H "Origin: $ORIGIN" | grep -i "access-control"

echo ""
echo "✅ Done! Check if Access-Control-Allow-Origin header is present."
echo ""
echo "Expected headers:"
echo "  ✓ Access-Control-Allow-Origin: $ORIGIN"
echo "  ✓ Access-Control-Allow-Credentials: true"
echo "  ✓ Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD"
