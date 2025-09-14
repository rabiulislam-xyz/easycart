#!/bin/bash

# EasyCart Demo Data Population Script
# This script creates a demo shop with sample products and categories

set -e

API_URL="http://localhost:8080/api/v1"
echo "🛒 EasyCart Demo Data Population"
echo "================================"

# Demo user credentials
DEMO_EMAIL="demo@easycart.com"
DEMO_PASSWORD="Demo123!"
DEMO_USER_DATA='{
  "email": "'$DEMO_EMAIL'",
  "password": "'$DEMO_PASSWORD'",
  "first_name": "John",
  "last_name": "Doe"
}'

echo "📝 Step 1: Creating demo user..."
REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "$DEMO_USER_DATA" || echo '{"error": "User may already exist"}')

echo "Response: $REGISTER_RESPONSE"

echo "🔐 Step 2: Logging in as demo user..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "'$DEMO_EMAIL'", "password": "'$DEMO_PASSWORD'"}')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token // empty')
if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  echo "❌ Failed to get authentication token"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

echo "✅ Successfully logged in! Token: ${TOKEN:0:20}..."

# Create demo shop
echo "🏪 Step 3: Creating demo shop..."
SHOP_DATA='{
  "name": "Demo Electronics Store",
  "description": "Your one-stop shop for the latest electronics and gadgets. We offer high-quality products at competitive prices with excellent customer service.",
  "primary_color": "#2563EB",
  "secondary_color": "#64748B"
}'

SHOP_RESPONSE=$(curl -s -X POST "$API_URL/shops" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "$SHOP_DATA")

SHOP_ID=$(echo $SHOP_RESPONSE | jq -r '.id // empty')
SHOP_SLUG=$(echo $SHOP_RESPONSE | jq -r '.slug // empty')

if [ -z "$SHOP_ID" ] || [ "$SHOP_ID" = "null" ]; then
  echo "❌ Failed to create shop"
  echo "Response: $SHOP_RESPONSE"
  exit 1
fi

echo "✅ Shop created! ID: $SHOP_ID, Slug: $SHOP_SLUG"

# Create categories
echo "📂 Step 4: Creating product categories..."

declare -a CATEGORIES=(
  '{"name": "Smartphones", "description": "Latest smartphones and mobile devices"}'
  '{"name": "Laptops", "description": "High-performance laptops and notebooks"}'
  '{"name": "Headphones", "description": "Premium audio equipment and headphones"}'
  '{"name": "Accessories", "description": "Phone cases, chargers, and tech accessories"}'
  '{"name": "Gaming", "description": "Gaming gear and accessories"}'
)

declare -a CATEGORY_IDS=()

for category in "${CATEGORIES[@]}"; do
  CATEGORY_RESPONSE=$(curl -s -X POST "$API_URL/categories" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "$category")
  
  CATEGORY_ID=$(echo $CATEGORY_RESPONSE | jq -r '.id // empty')
  CATEGORY_NAME=$(echo $CATEGORY_RESPONSE | jq -r '.name // empty')
  
  if [ -n "$CATEGORY_ID" ] && [ "$CATEGORY_ID" != "null" ]; then
    CATEGORY_IDS+=("$CATEGORY_ID")
    echo "✅ Created category: $CATEGORY_NAME (ID: $CATEGORY_ID)"
  else
    echo "⚠️  Failed to create category: $category"
  fi
done

echo "📦 Step 5: Creating demo products..."

# Demo products with realistic data
declare -a PRODUCTS=(
  '{
    "name": "iPhone 15 Pro",
    "description": "The latest iPhone with titanium design, A17 Pro chip, and advanced camera system. Features include 48MP main camera, Action Button, and USB-C connectivity.",
    "price": 119999,
    "compare_price": 129999,
    "sku": "IPHONE-15-PRO-128",
    "stock": 25,
    "category_id": "'${CATEGORY_IDS[0]}'",
    "is_active": true
  }'
  '{
    "name": "Samsung Galaxy S24 Ultra",
    "description": "Premium Android flagship with S Pen, 200MP camera, and AI-powered features. Includes 12GB RAM, 256GB storage, and 5000mAh battery.",
    "price": 109999,
    "compare_price": 119999,
    "sku": "SAMSUNG-S24-ULTRA-256",
    "stock": 18,
    "category_id": "'${CATEGORY_IDS[0]}'",
    "is_active": true
  }'
  '{
    "name": "MacBook Pro 14-inch M3",
    "description": "Supercharged by M3 chip with 8-core CPU and 10-core GPU. Features Liquid Retina XDR display, up to 22 hours battery life, and advanced thermal design.",
    "price": 199999,
    "compare_price": 219999,
    "sku": "MACBOOK-PRO-14-M3-512",
    "stock": 12,
    "category_id": "'${CATEGORY_IDS[1]}'",
    "is_active": true
  }'
  '{
    "name": "Dell XPS 13 Plus",
    "description": "Ultra-thin laptop with 13.4-inch InfinityEdge display, 12th Gen Intel Core processors, and premium build quality. Perfect for professionals.",
    "price": 154999,
    "compare_price": 169999,
    "sku": "DELL-XPS-13-PLUS-512",
    "stock": 15,
    "category_id": "'${CATEGORY_IDS[1]}'",
    "is_active": true
  }'
  '{
    "name": "Sony WH-1000XM5",
    "description": "Industry-leading noise canceling wireless headphones with 30-hour battery life, crystal clear hands-free calling, and premium comfort.",
    "price": 39999,
    "compare_price": 44999,
    "sku": "SONY-WH1000XM5-BLACK",
    "stock": 30,
    "category_id": "'${CATEGORY_IDS[2]}'",
    "is_active": true
  }'
  '{
    "name": "Apple AirPods Pro (2nd gen)",
    "description": "Next-level AirPods Pro with adaptive transparency, personalized spatial audio, and up to 2x more active noise cancellation.",
    "price": 24999,
    "compare_price": 29999,
    "sku": "AIRPODS-PRO-2ND-GEN",
    "stock": 45,
    "category_id": "'${CATEGORY_IDS[2]}'",
    "is_active": true
  }'
  '{
    "name": "Wireless Charging Pad",
    "description": "Fast 15W wireless charging pad compatible with iPhone, Samsung, and other Qi-enabled devices. Includes USB-C cable and LED indicator.",
    "price": 2999,
    "compare_price": 3999,
    "sku": "WIRELESS-CHARGER-15W",
    "stock": 50,
    "category_id": "'${CATEGORY_IDS[3]}'",
    "is_active": true
  }'
  '{
    "name": "Premium Phone Case Bundle",
    "description": "Complete protection bundle including shock-resistant case, tempered glass screen protector, and cleaning kit. Available for various phone models.",
    "price": 1999,
    "compare_price": 2999,
    "sku": "PHONE-CASE-BUNDLE",
    "stock": 75,
    "category_id": "'${CATEGORY_IDS[3]}'",
    "is_active": true
  }'
  '{
    "name": "Gaming Mechanical Keyboard",
    "description": "RGB backlit mechanical keyboard with Cherry MX switches, programmable keys, and anti-ghosting technology. Perfect for gaming and productivity.",
    "price": 8999,
    "compare_price": 11999,
    "sku": "GAMING-KB-RGB-MECH",
    "stock": 22,
    "category_id": "'${CATEGORY_IDS[4]}'",
    "is_active": true
  }'
  '{
    "name": "Wireless Gaming Mouse",
    "description": "High-precision gaming mouse with 16,000 DPI sensor, 11 programmable buttons, and 60-hour battery life. Includes wireless charging dock.",
    "price": 7999,
    "compare_price": 9999,
    "sku": "GAMING-MOUSE-WIRELESS",
    "stock": 28,
    "category_id": "'${CATEGORY_IDS[4]}'",
    "is_active": true
  }'
)

PRODUCT_COUNT=0
for product in "${PRODUCTS[@]}"; do
  # Skip if category_id is empty
  if [[ "$product" == *'"category_id": ""'* ]]; then
    echo "⚠️  Skipping product due to missing category"
    continue
  fi
  
  PRODUCT_RESPONSE=$(curl -s -X POST "$API_URL/products" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "$product")
  
  PRODUCT_ID=$(echo $PRODUCT_RESPONSE | jq -r '.id // empty')
  PRODUCT_NAME=$(echo $PRODUCT_RESPONSE | jq -r '.name // empty')
  
  if [ -n "$PRODUCT_ID" ] && [ "$PRODUCT_ID" != "null" ]; then
    PRODUCT_COUNT=$((PRODUCT_COUNT + 1))
    echo "✅ Created product: $PRODUCT_NAME (ID: $PRODUCT_ID)"
  else
    echo "⚠️  Failed to create product: $PRODUCT_NAME"
    echo "Response: $PRODUCT_RESPONSE"
  fi
done

echo ""
echo "🎉 Demo Data Population Complete!"
echo "================================="
echo "✅ Demo User: $DEMO_EMAIL / $DEMO_PASSWORD"
echo "✅ Demo Shop: $SHOP_SLUG (ID: $SHOP_ID)"
echo "✅ Categories: ${#CATEGORY_IDS[@]} created"
echo "✅ Products: $PRODUCT_COUNT created"
echo ""
echo "🌐 Access your demo store at:"
echo "   Frontend: http://localhost:3000"
echo "   Login: http://localhost:3000/login"
echo "   Dashboard: http://localhost:3000/dashboard"
echo "   Storefront: http://localhost:3000/store/$SHOP_SLUG"
echo ""
echo "🔑 Demo Credentials:"
echo "   Email: $DEMO_EMAIL"
echo "   Password: $DEMO_PASSWORD"
echo ""
echo "Happy testing! 🛒✨"