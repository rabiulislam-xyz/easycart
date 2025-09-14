#!/bin/bash

echo "🔍 EasyCart Demo Data Verification"
echo "================================="

# Test storefront accessibility
echo "📱 Testing Storefront:"
STORE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/store/demo-electronics-store)
echo "   Store page: HTTP $STORE_STATUS"

# Test API health
echo "🏥 Testing API Health:"
API_HEALTH=$(curl -s http://localhost:8080/api/v1/health)
echo "   API: $API_HEALTH"

# Test login endpoint  
echo "🔐 Testing Authentication:"
LOGIN_TEST=$(curl -s -X POST "http://localhost:8080/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@easycart.com","password":"Demo123!"}' \
  -w "%{http_code}")
echo "   Login endpoint response code in output"

# Test public storefront data
echo "🛒 Testing Public Storefront Data:"
STOREFRONT_DATA=$(curl -s "http://localhost:8080/api/v1/storefront/demo-electronics-store")
echo "   Storefront API: ${STOREFRONT_DATA:0:100}..."

echo ""
echo "✅ Demo Data Status Summary:"
echo "   🌐 Frontend: http://localhost:3000"
echo "   🏪 Demo Store: http://localhost:3000/store/demo-electronics-store" 
echo "   🔑 Login Credentials: demo@easycart.com / Demo123!"
echo "   📊 Dashboard: http://localhost:3000/dashboard"
echo ""
echo "To test the complete flow:"
echo "1. Visit http://localhost:3000/login"
echo "2. Login with demo@easycart.com / Demo123!"
echo "3. Access dashboard at http://localhost:3000/dashboard"  
echo "4. View your storefront at http://localhost:3000/store/demo-electronics-store"