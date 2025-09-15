#!/bin/bash

# Demo data script for EasyCart
# This script creates demo categories and products

API_URL="http://localhost:8080"

echo "Creating admin user if not exists..."
docker exec easycart-backend-1 ./admin create-admin

echo "Waiting for backend to be ready..."
sleep 3

echo "Please enter admin credentials to create demo data:"
read -p "Admin email: " ADMIN_EMAIL
read -s -p "Admin password: " ADMIN_PASSWORD
echo

# Login to get token
echo "Logging in as admin..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "Login failed. Please check your credentials."
  exit 1
fi

echo "Login successful!"

# Create categories
echo "Creating categories..."

CATEGORY_1=$(curl -s -X POST "$API_URL/api/v1/categories" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Smartphones","description":"Latest smartphones and mobile devices"}')

CATEGORY_2=$(curl -s -X POST "$API_URL/api/v1/categories" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Laptops","description":"High-performance laptops and notebooks"}')

CATEGORY_3=$(curl -s -X POST "$API_URL/api/v1/categories" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Headphones","description":"Premium audio devices and headphones"}')

CATEGORY_4=$(curl -s -X POST "$API_URL/api/v1/categories" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Tablets","description":"Tablets and e-readers"}')

# Extract category IDs
CAT1_ID=$(echo $CATEGORY_1 | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
CAT2_ID=$(echo $CATEGORY_2 | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
CAT3_ID=$(echo $CATEGORY_3 | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
CAT4_ID=$(echo $CATEGORY_4 | grep -o '"id":"[^"]*"' | cut -d'"' -f4)

echo "Categories created successfully!"

# Create products
echo "Creating products..."

# Smartphones
curl -s -X POST "$API_URL/api/v1/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"name\":\"iPhone 15 Pro\",
    \"description\":\"The latest iPhone with A17 Pro chip, titanium design, and advanced camera system. Features include 6.1-inch Super Retina XDR display, USB-C connector, and up to 1TB storage.\",
    \"category_id\":\"$CAT1_ID\",
    \"price\":99900,
    \"compare_price\":109900,
    \"stock\":25,
    \"min_stock\":5,
    \"weight\":187,
    \"sku\":\"IPH15PRO-128\",
    \"is_active\":true,
    \"is_featured\":true
  }" > /dev/null

curl -s -X POST "$API_URL/api/v1/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"name\":\"Samsung Galaxy S24 Ultra\",
    \"description\":\"Premium Android smartphone with S Pen, 200MP camera, and 6.8-inch Dynamic AMOLED display. Powered by Snapdragon 8 Gen 3 processor.\",
    \"category_id\":\"$CAT1_ID\",
    \"price\":119900,
    \"stock\":20,
    \"min_stock\":3,
    \"weight\":232,
    \"sku\":\"SAM-S24U-256\",
    \"is_active\":true,
    \"is_featured\":true
  }" > /dev/null

curl -s -X POST "$API_URL/api/v1/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"name\":\"Google Pixel 8 Pro\",
    \"description\":\"Google's flagship smartphone with advanced AI features, Magic Eraser, and pure Android experience. Features 6.7-inch LTPO OLED display.\",
    \"category_id\":\"$CAT1_ID\",
    \"price\":89900,
    \"stock\":15,
    \"min_stock\":5,
    \"weight\":210,
    \"sku\":\"GPIX8PRO-128\",
    \"is_active\":true,
    \"is_featured\":false
  }" > /dev/null

# Laptops
curl -s -X POST "$API_URL/api/v1/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"name\":\"MacBook Pro 16-inch M3\",
    \"description\":\"Powerful laptop with Apple M3 chip, 16-inch Liquid Retina XDR display, and up to 22 hours of battery life. Perfect for professionals and creators.\",
    \"category_id\":\"$CAT2_ID\",
    \"price\":249900,
    \"compare_price\":279900,
    \"stock\":12,
    \"min_stock\":2,
    \"weight\":2200,
    \"sku\":\"MBP16-M3-512\",
    \"is_active\":true,
    \"is_featured\":true
  }" > /dev/null

curl -s -X POST "$API_URL/api/v1/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"name\":\"Dell XPS 13 Plus\",
    \"description\":\"Ultra-thin laptop with 13.4-inch InfinityEdge display, 12th Gen Intel Core processors, and premium design. Ideal for productivity and portability.\",
    \"category_id\":\"$CAT2_ID\",
    \"price\":129900,
    \"stock\":18,
    \"min_stock\":3,
    \"weight\":1250,
    \"sku\":\"DELL-XPS13P-512\",
    \"is_active\":true,
    \"is_featured\":false
  }" > /dev/null

curl -s -X POST "$API_URL/api/v1/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"name\":\"HP Spectre x360 14\",
    \"description\":\"2-in-1 convertible laptop with 13.5-inch OLED display, Intel Evo platform, and 360-degree hinge. Perfect for versatile computing needs.\",
    \"category_id\":\"$CAT2_ID\",
    \"price\":159900,
    \"stock\":10,
    \"min_stock\":2,
    \"weight\":1320,
    \"sku\":\"HP-SPEC360-512\",
    \"is_active\":true,
    \"is_featured\":false
  }" > /dev/null

# Headphones
curl -s -X POST "$API_URL/api/v1/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"name\":\"Sony WH-1000XM5\",
    \"description\":\"Industry-leading noise canceling wireless headphones with 30-hour battery life, exceptional sound quality, and premium comfort.\",
    \"category_id\":\"$CAT3_ID\",
    \"price\":39999,
    \"compare_price\":49999,
    \"stock\":30,
    \"min_stock\":5,
    \"weight\":250,
    \"sku\":\"SONY-WH1000XM5\",
    \"is_active\":true,
    \"is_featured\":true
  }" > /dev/null

curl -s -X POST "$API_URL/api/v1/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"name\":\"Bose QuietComfort 45\",
    \"description\":\"Comfortable wireless headphones with world-class noise cancellation, 24-hour battery life, and balanced audio performance.\",
    \"category_id\":\"$CAT3_ID\",
    \"price\":32999,
    \"stock\":25,
    \"min_stock\":5,
    \"weight\":240,
    \"sku\":\"BOSE-QC45\",
    \"is_active\":true,
    \"is_featured\":false
  }" > /dev/null

curl -s -X POST "$API_URL/api/v1/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"name\":\"AirPods Pro (2nd generation)\",
    \"description\":\"Apple's premium wireless earbuds with active noise cancellation, spatial audio, and MagSafe charging case. Up to 6 hours of listening time.\",
    \"category_id\":\"$CAT3_ID\",
    \"price\":24999,
    \"stock\":40,
    \"min_stock\":10,
    \"weight\":50,
    \"sku\":\"APP-2ND-GEN\",
    \"is_active\":true,
    \"is_featured\":true
  }" > /dev/null

# Tablets
curl -s -X POST "$API_URL/api/v1/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"name\":\"iPad Pro 12.9-inch M2\",
    \"description\":\"Most advanced iPad with M2 chip, 12.9-inch Liquid Retina XDR display, and support for Apple Pencil 2nd generation. Perfect for creative professionals.\",
    \"category_id\":\"$CAT4_ID\",
    \"price\":109999,
    \"compare_price\":129999,
    \"stock\":15,
    \"min_stock\":3,
    \"weight\":682,
    \"sku\":\"IPAD-PRO12-M2-256\",
    \"is_active\":true,
    \"is_featured\":true
  }" > /dev/null

curl -s -X POST "$API_URL/api/v1/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"name\":\"Samsung Galaxy Tab S9\",
    \"description\":\"Premium Android tablet with S Pen included, 11-inch Dynamic AMOLED display, and DeX mode for desktop productivity.\",
    \"category_id\":\"$CAT4_ID\",
    \"price\":79999,
    \"stock\":20,
    \"min_stock\":5,
    \"weight\":498,
    \"sku\":\"SAM-TABS9-256\",
    \"is_active\":true,
    \"is_featured\":false
  }" > /dev/null

curl -s -X POST "$API_URL/api/v1/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"name\":\"Microsoft Surface Pro 9\",
    \"description\":\"Versatile 2-in-1 laptop tablet with 13-inch PixelSense touchscreen, Intel 12th Gen processors, and all-day battery life.\",
    \"category_id\":\"$CAT4_ID\",
    \"price\":99999,
    \"stock\":12,
    \"min_stock\":3,
    \"weight\":879,
    \"sku\":\"MSFT-SP9-256\",
    \"is_active\":true,
    \"is_featured\":false
  }" > /dev/null

echo "Demo data created successfully!"
echo "Categories: Smartphones, Laptops, Headphones, Tablets"
echo "Products: 12 demo products across all categories"
echo "Visit http://localhost:3000 to see your store!"