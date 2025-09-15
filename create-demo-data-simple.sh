#!/bin/bash

# Simple demo data creation script
API_URL="http://localhost:8080"
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZjcyNGU0YzktNjJkNC00YWY3LTgzNzktN2U5YzEwZjI0YmQ2IiwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsImV4cCI6MTc1ODAyNDQ3MCwiaWF0IjoxNzU3OTM4MDcwfQ.lMUpib0VfpN8S5mFwGAPebATXGKygO0rdecDBsgZsfg"

echo "Creating demo categories and products..."

# Create categories
echo "Creating categories..."

SMARTPHONES=$(curl -s -X POST "$API_URL/api/v1/categories" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Smartphones","description":"Latest smartphones and mobile devices"}')

LAPTOPS=$(curl -s -X POST "$API_URL/api/v1/categories" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Laptops","description":"High-performance laptops and notebooks"}')

HEADPHONES=$(curl -s -X POST "$API_URL/api/v1/categories" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Headphones","description":"Premium audio devices and headphones"}')

TABLETS=$(curl -s -X POST "$API_URL/api/v1/categories" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Tablets","description":"Tablets and e-readers"}')

echo "Categories created!"

# Extract category IDs (using a simpler method)
SMARTPHONE_ID=$(echo $SMARTPHONES | sed 's/.*"id":"\([^"]*\)".*/\1/')
LAPTOP_ID=$(echo $LAPTOPS | sed 's/.*"id":"\([^"]*\)".*/\1/')
HEADPHONE_ID=$(echo $HEADPHONES | sed 's/.*"id":"\([^"]*\)".*/\1/')
TABLET_ID=$(echo $TABLETS | sed 's/.*"id":"\([^"]*\)".*/\1/')

echo "Category IDs extracted: $SMARTPHONE_ID, $LAPTOP_ID, $HEADPHONE_ID, $TABLET_ID"

# Create products
echo "Creating products..."

# iPhone 15 Pro
curl -s -X POST "$API_URL/api/v1/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"name\":\"iPhone 15 Pro\",
    \"description\":\"The latest iPhone with A17 Pro chip, titanium design, and advanced camera system.\",
    \"category_id\":\"$SMARTPHONE_ID\",
    \"price\":99900,
    \"compare_price\":109900,
    \"stock\":25,
    \"min_stock\":5,
    \"weight\":187,
    \"sku\":\"IPH15PRO-128\",
    \"is_active\":true,
    \"is_featured\":true
  }" > /dev/null

# Samsung Galaxy S24 Ultra
curl -s -X POST "$API_URL/api/v1/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"name\":\"Samsung Galaxy S24 Ultra\",
    \"description\":\"Premium Android smartphone with S Pen and 200MP camera.\",
    \"category_id\":\"$SMARTPHONE_ID\",
    \"price\":119900,
    \"stock\":20,
    \"min_stock\":3,
    \"weight\":232,
    \"sku\":\"SAM-S24U-256\",
    \"is_active\":true,
    \"is_featured\":true
  }" > /dev/null

# MacBook Pro 16-inch M3
curl -s -X POST "$API_URL/api/v1/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"name\":\"MacBook Pro 16-inch M3\",
    \"description\":\"Powerful laptop with Apple M3 chip and 16-inch Liquid Retina XDR display.\",
    \"category_id\":\"$LAPTOP_ID\",
    \"price\":249900,
    \"compare_price\":279900,
    \"stock\":12,
    \"min_stock\":2,
    \"weight\":2200,
    \"sku\":\"MBP16-M3-512\",
    \"is_active\":true,
    \"is_featured\":true
  }" > /dev/null

# Sony WH-1000XM5
curl -s -X POST "$API_URL/api/v1/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"name\":\"Sony WH-1000XM5\",
    \"description\":\"Industry-leading noise canceling wireless headphones with 30-hour battery life.\",
    \"category_id\":\"$HEADPHONE_ID\",
    \"price\":39999,
    \"compare_price\":49999,
    \"stock\":30,
    \"min_stock\":5,
    \"weight\":250,
    \"sku\":\"SONY-WH1000XM5\",
    \"is_active\":true,
    \"is_featured\":true
  }" > /dev/null

# AirPods Pro (2nd generation)
curl -s -X POST "$API_URL/api/v1/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"name\":\"AirPods Pro (2nd generation)\",
    \"description\":\"Apple's premium wireless earbuds with active noise cancellation and spatial audio.\",
    \"category_id\":\"$HEADPHONE_ID\",
    \"price\":24999,
    \"stock\":40,
    \"min_stock\":10,
    \"weight\":50,
    \"sku\":\"APP-2ND-GEN\",
    \"is_active\":true,
    \"is_featured\":true
  }" > /dev/null

# iPad Pro 12.9-inch M2
curl -s -X POST "$API_URL/api/v1/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"name\":\"iPad Pro 12.9-inch M2\",
    \"description\":\"Most advanced iPad with M2 chip and 12.9-inch Liquid Retina XDR display.\",
    \"category_id\":\"$TABLET_ID\",
    \"price\":109999,
    \"compare_price\":129999,
    \"stock\":15,
    \"min_stock\":3,
    \"weight\":682,
    \"sku\":\"IPAD-PRO12-M2-256\",
    \"is_active\":true,
    \"is_featured\":true
  }" > /dev/null

echo "Demo data created successfully!"
echo "4 Categories: Smartphones, Laptops, Headphones, Tablets"
echo "6 Featured Products added"
echo "Admin credentials: admin@example.com / password123"
echo "Visit http://localhost:3000 to see your store!"