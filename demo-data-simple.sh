#!/bin/bash

# EasyCart Demo Data Population Script (without jq dependency)
# This script creates a demo shop with sample products and categories

set -e

API_URL="http://localhost:8080/api/v1"
echo "🛒 EasyCart Demo Data Population"
echo "================================"

# Demo user credentials
DEMO_EMAIL="demo@easycart.com"
DEMO_PASSWORD="Demo123!"

echo "🔐 Step 1: Logging in as demo user..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "'$DEMO_EMAIL'", "password": "'$DEMO_PASSWORD'"}')

echo "Login Response: $LOGIN_RESPONSE"

# Extract token using grep and sed (basic JSON parsing)
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | sed 's/"token":"//' | sed 's/"//')

if [ -z "$TOKEN" ]; then
  echo "❌ Failed to get authentication token - user may not exist, creating user first..."
  
  echo "📝 Creating demo user..."
  REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
    -H "Content-Type: application/json" \
    -d '{"email": "'$DEMO_EMAIL'", "password": "'$DEMO_PASSWORD'", "first_name": "John", "last_name": "Doe"}')
  
  echo "Register Response: $REGISTER_RESPONSE"
  
  # Extract token from registration response
  TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"token":"[^"]*"' | sed 's/"token":"//' | sed 's/"//')
  
  if [ -z "$TOKEN" ]; then
    echo "❌ Failed to get token after registration"
    exit 1
  fi
fi

echo "✅ Successfully got token: ${TOKEN:0:20}..."

# Create demo shop
echo "🏪 Step 2: Creating demo shop..."
SHOP_RESPONSE=$(curl -s -X POST "$API_URL/shop" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Demo Electronics Store",
    "description": "Your one-stop shop for the latest electronics and gadgets. We offer high-quality products at competitive prices with excellent customer service.",
    "primary_color": "#2563EB",
    "secondary_color": "#64748B"
  }')

echo "Shop Response: $SHOP_RESPONSE"

# Extract shop details
SHOP_ID=$(echo $SHOP_RESPONSE | grep -o '"id":"[^"]*"' | head -1 | sed 's/"id":"//' | sed 's/"//')
SHOP_SLUG=$(echo $SHOP_RESPONSE | grep -o '"slug":"[^"]*"' | sed 's/"slug":"//' | sed 's/"//')

if [ -z "$SHOP_ID" ]; then
  echo "❌ Failed to create shop or shop already exists"
  # Try to get existing shop
  GET_SHOP_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" "$API_URL/shop")
  echo "Get Shop Response: $GET_SHOP_RESPONSE"
  SHOP_ID=$(echo $GET_SHOP_RESPONSE | grep -o '"id":"[^"]*"' | head -1 | sed 's/"id":"//' | sed 's/"//')
  SHOP_SLUG=$(echo $GET_SHOP_RESPONSE | grep -o '"slug":"[^"]*"' | sed 's/"slug":"//' | sed 's/"//')
fi

echo "✅ Shop: ID=$SHOP_ID, Slug=$SHOP_SLUG"

# Create categories
echo "📂 Step 3: Creating product categories..."

declare -a CATEGORY_NAMES=("Smartphones" "Laptops" "Headphones" "Accessories" "Gaming")
declare -a CATEGORY_DESCRIPTIONS=(
  "Latest smartphones and mobile devices"
  "High-performance laptops and notebooks"  
  "Premium audio equipment and headphones"
  "Phone cases, chargers, and tech accessories"
  "Gaming gear and accessories"
)

declare -a CATEGORY_IDS=()

for i in "${!CATEGORY_NAMES[@]}"; do
  CATEGORY_RESPONSE=$(curl -s -X POST "$API_URL/categories" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
      "name": "'${CATEGORY_NAMES[i]}'",
      "description": "'${CATEGORY_DESCRIPTIONS[i]}'"
    }')
  
  CATEGORY_ID=$(echo $CATEGORY_RESPONSE | grep -o '"id":"[^"]*"' | head -1 | sed 's/"id":"//' | sed 's/"//')
  
  if [ -n "$CATEGORY_ID" ]; then
    CATEGORY_IDS+=("$CATEGORY_ID")
    echo "✅ Created category: ${CATEGORY_NAMES[i]} (ID: $CATEGORY_ID)"
  else
    echo "⚠️  Failed to create category: ${CATEGORY_NAMES[i]}"
    echo "Response: $CATEGORY_RESPONSE"
  fi
done

echo "📦 Step 4: Creating demo products..."

# Create products for each category
PRODUCT_COUNT=0

# Smartphones
if [ ${#CATEGORY_IDS[@]} -gt 0 ]; then
  curl -s -X POST "$API_URL/products" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
      "name": "iPhone 15 Pro",
      "description": "The latest iPhone with titanium design, A17 Pro chip, and advanced camera system.",
      "price": 119999,
      "compare_price": 129999,
      "sku": "IPHONE-15-PRO-128",
      "stock": 25,
      "category_id": "'${CATEGORY_IDS[0]}'",
      "is_active": true
    }' > /dev/null && echo "✅ Created: iPhone 15 Pro" && ((PRODUCT_COUNT++))

  curl -s -X POST "$API_URL/products" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
      "name": "Samsung Galaxy S24 Ultra",
      "description": "Premium Android flagship with S Pen, 200MP camera, and AI-powered features.",
      "price": 109999,
      "compare_price": 119999,
      "sku": "SAMSUNG-S24-ULTRA-256",
      "stock": 18,
      "category_id": "'${CATEGORY_IDS[0]}'",
      "is_active": true
    }' > /dev/null && echo "✅ Created: Samsung Galaxy S24 Ultra" && ((PRODUCT_COUNT++))
fi

# Laptops
if [ ${#CATEGORY_IDS[@]} -gt 1 ]; then
  curl -s -X POST "$API_URL/products" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
      "name": "MacBook Pro 14-inch M3",
      "description": "Supercharged by M3 chip with 8-core CPU and 10-core GPU.",
      "price": 199999,
      "compare_price": 219999,
      "sku": "MACBOOK-PRO-14-M3-512",
      "stock": 12,
      "category_id": "'${CATEGORY_IDS[1]}'",
      "is_active": true
    }' > /dev/null && echo "✅ Created: MacBook Pro 14-inch M3" && ((PRODUCT_COUNT++))

  curl -s -X POST "$API_URL/products" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
      "name": "Dell XPS 13 Plus",
      "description": "Ultra-thin laptop with 13.4-inch InfinityEdge display and 12th Gen Intel Core processors.",
      "price": 154999,
      "compare_price": 169999,
      "sku": "DELL-XPS-13-PLUS-512",
      "stock": 15,
      "category_id": "'${CATEGORY_IDS[1]}'",
      "is_active": true
    }' > /dev/null && echo "✅ Created: Dell XPS 13 Plus" && ((PRODUCT_COUNT++))
fi

# Headphones
if [ ${#CATEGORY_IDS[@]} -gt 2 ]; then
  curl -s -X POST "$API_URL/products" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
      "name": "Sony WH-1000XM5",
      "description": "Industry-leading noise canceling wireless headphones with 30-hour battery life.",
      "price": 39999,
      "compare_price": 44999,
      "sku": "SONY-WH1000XM5-BLACK",
      "stock": 30,
      "category_id": "'${CATEGORY_IDS[2]}'",
      "is_active": true
    }' > /dev/null && echo "✅ Created: Sony WH-1000XM5" && ((PRODUCT_COUNT++))

  curl -s -X POST "$API_URL/products" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
      "name": "Apple AirPods Pro (2nd gen)",
      "description": "Next-level AirPods Pro with adaptive transparency and personalized spatial audio.",
      "price": 24999,
      "compare_price": 29999,
      "sku": "AIRPODS-PRO-2ND-GEN",
      "stock": 45,
      "category_id": "'${CATEGORY_IDS[2]}'",
      "is_active": true
    }' > /dev/null && echo "✅ Created: Apple AirPods Pro (2nd gen)" && ((PRODUCT_COUNT++))
fi

# Accessories
if [ ${#CATEGORY_IDS[@]} -gt 3 ]; then
  curl -s -X POST "$API_URL/products" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
      "name": "Wireless Charging Pad",
      "description": "Fast 15W wireless charging pad compatible with iPhone, Samsung, and other Qi-enabled devices.",
      "price": 2999,
      "compare_price": 3999,
      "sku": "WIRELESS-CHARGER-15W",
      "stock": 50,
      "category_id": "'${CATEGORY_IDS[3]}'",
      "is_active": true
    }' > /dev/null && echo "✅ Created: Wireless Charging Pad" && ((PRODUCT_COUNT++))

  curl -s -X POST "$API_URL/products" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
      "name": "Premium Phone Case Bundle",
      "description": "Complete protection bundle including shock-resistant case and tempered glass screen protector.",
      "price": 1999,
      "compare_price": 2999,
      "sku": "PHONE-CASE-BUNDLE",
      "stock": 75,
      "category_id": "'${CATEGORY_IDS[3]}'",
      "is_active": true
    }' > /dev/null && echo "✅ Created: Premium Phone Case Bundle" && ((PRODUCT_COUNT++))
fi

# Gaming
if [ ${#CATEGORY_IDS[@]} -gt 4 ]; then
  curl -s -X POST "$API_URL/products" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
      "name": "Gaming Mechanical Keyboard",
      "description": "RGB backlit mechanical keyboard with Cherry MX switches and anti-ghosting technology.",
      "price": 8999,
      "compare_price": 11999,
      "sku": "GAMING-KB-RGB-MECH",
      "stock": 22,
      "category_id": "'${CATEGORY_IDS[4]}'",
      "is_active": true
    }' > /dev/null && echo "✅ Created: Gaming Mechanical Keyboard" && ((PRODUCT_COUNT++))

  curl -s -X POST "$API_URL/products" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
      "name": "Wireless Gaming Mouse",
      "description": "High-precision gaming mouse with 16,000 DPI sensor and 60-hour battery life.",
      "price": 7999,
      "compare_price": 9999,
      "sku": "GAMING-MOUSE-WIRELESS",
      "stock": 28,
      "category_id": "'${CATEGORY_IDS[4]}'",
      "is_active": true
    }' > /dev/null && echo "✅ Created: Wireless Gaming Mouse" && ((PRODUCT_COUNT++))
fi

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