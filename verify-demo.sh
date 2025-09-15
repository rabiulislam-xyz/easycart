#!/bin/bash

# Simple script to verify demo data is working
API_URL="http://localhost:8080"

echo "=== EasyCart Demo Verification ==="
echo "Admin credentials: admin@example.com / password123"
echo "Visit: http://localhost:3000"
echo

echo "1. Checking backend health..."
HEALTH=$(curl -s "$API_URL/api/v1/health")
echo "Health: $HEALTH"
echo

echo "2. Checking existing categories..."
CATEGORIES=$(curl -s "$API_URL/api/v1/store/categories")
echo "Categories: $CATEGORIES"
echo

echo "3. Checking existing products..."
PRODUCTS=$(curl -s "$API_URL/api/v1/store/products")
echo "Products: $PRODUCTS"
echo

echo "4. Checking store settings..."
SETTINGS=$(curl -s "$API_URL/api/v1/store")
echo "Settings: $SETTINGS"
echo

echo "=== Demo Ready! ==="
echo "Frontend: http://localhost:3000"
echo "Admin Panel: http://localhost:3000/admin"
echo "Login: admin@example.com / password123"