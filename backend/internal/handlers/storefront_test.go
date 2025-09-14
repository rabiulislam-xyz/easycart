package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"easycart/internal/testutil"
	"easycart/internal/validator"
	"github.com/labstack/echo/v4"
)

func TestStorefrontHandler_GetShop(t *testing.T) {
	db, cleanup := testutil.SetupTestDB()
	defer cleanup()
	
	handler := NewStorefrontHandler(db)
	e := echo.New()

	t.Run("get shop by slug successfully", func(t *testing.T) {
		testutil.CleanupDB(db)
		
		user := testutil.CreateTestUser(db, "test@example.com")
		shop := testutil.CreateTestShop(db, user, "Test Shop")
		
		req := httptest.NewRequest(http.MethodGet, "/store/test-shop", nil)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		c.SetParamNames("slug")
		c.SetParamValues("test-shop")

		err := handler.GetShop(c)
		if err != nil {
			t.Fatalf("GetShop() error = %v", err)
		}

		if rec.Code != http.StatusOK {
			t.Errorf("Expected status %d, got %d", http.StatusOK, rec.Code)
		}

		var response map[string]interface{}
		json.Unmarshal(rec.Body.Bytes(), &response)
		
		if response["name"] != "Test Shop" {
			t.Error("Expected correct shop name in response")
		}
		if response["slug"] != "test-shop" {
			t.Error("Expected correct shop slug in response")
		}
	})

	t.Run("get nonexistent shop", func(t *testing.T) {
		testutil.CleanupDB(db)
		
		req := httptest.NewRequest(http.MethodGet, "/store/nonexistent", nil)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		c.SetParamNames("slug")
		c.SetParamValues("nonexistent")

		err := handler.GetShop(c)
		if err == nil {
			t.Error("Expected error for nonexistent shop")
		}

		httpErr, ok := err.(*echo.HTTPError)
		if !ok || httpErr.Code != http.StatusNotFound {
			t.Errorf("Expected not found error, got %v", err)
		}
	})
}

func TestStorefrontHandler_GetShopProducts(t *testing.T) {
	db, cleanup := testutil.SetupTestDB()
	defer cleanup()
	
	handler := NewStorefrontHandler(db)
	e := echo.New()

	t.Run("get shop products successfully", func(t *testing.T) {
		testutil.CleanupDB(db)
		
		user := testutil.CreateTestUser(db, "test@example.com")
		shop := testutil.CreateTestShop(db, user, "Test Shop")
		testutil.CreateTestProduct(db, shop, "Product 1", 1000)
		testutil.CreateTestProduct(db, shop, "Product 2", 2000)
		
		req := httptest.NewRequest(http.MethodGet, "/store/test-shop/products", nil)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		c.SetParamNames("slug")
		c.SetParamValues("test-shop")

		err := handler.GetShopProducts(c)
		if err != nil {
			t.Fatalf("GetShopProducts() error = %v", err)
		}

		if rec.Code != http.StatusOK {
			t.Errorf("Expected status %d, got %d", http.StatusOK, rec.Code)
		}

		var response map[string]interface{}
		json.Unmarshal(rec.Body.Bytes(), &response)
		
		products, ok := response["products"].([]interface{})
		if !ok {
			t.Error("Expected products array in response")
		}
		
		if len(products) != 2 {
			t.Errorf("Expected 2 products, got %d", len(products))
		}
	})

	t.Run("search shop products", func(t *testing.T) {
		testutil.CleanupDB(db)
		
		user := testutil.CreateTestUser(db, "test@example.com")
		shop := testutil.CreateTestShop(db, user, "Test Shop")
		testutil.CreateTestProduct(db, shop, "iPhone 15", 99900)
		testutil.CreateTestProduct(db, shop, "Samsung Galaxy", 79900)
		
		req := httptest.NewRequest(http.MethodGet, "/store/test-shop/products?search=iPhone", nil)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		c.SetParamNames("slug")
		c.SetParamValues("test-shop")

		err := handler.GetShopProducts(c)
		if err != nil {
			t.Fatalf("GetShopProducts() error = %v", err)
		}

		var response map[string]interface{}
		json.Unmarshal(rec.Body.Bytes(), &response)
		
		products := response["products"].([]interface{})
		if len(products) != 1 {
			t.Errorf("Expected 1 product, got %d", len(products))
		}
		
		product := products[0].(map[string]interface{})
		if product["name"] != "iPhone 15" {
			t.Error("Expected iPhone 15 in search results")
		}
	})
}

func TestStorefrontHandler_CreatePublicOrder(t *testing.T) {
	db, cleanup := testutil.SetupTestDB()
	defer cleanup()
	
	handler := NewStorefrontHandler(db)
	e := echo.New()
	e.Validator = validator.New()

	t.Run("create order successfully", func(t *testing.T) {
		testutil.CleanupDB(db)
		
		user := testutil.CreateTestUser(db, "test@example.com")
		shop := testutil.CreateTestShop(db, user, "Test Shop")
		product := testutil.CreateTestProduct(db, shop, "Test Product", 2500)
		
		reqBody := map[string]interface{}{
			"customer_email":   "customer@example.com",
			"customer_name":    "John Customer",
			"shipping_address": "123 Main St",
			"shipping_city":    "Anytown",
			"shipping_zip":     "12345",
			"shipping_country": "US",
			"items": []map[string]interface{}{
				{
					"product_id": product.ID,
					"quantity":   2,
				},
			},
		}
		bodyBytes, _ := json.Marshal(reqBody)
		
		req := httptest.NewRequest(http.MethodPost, "/store/test-shop/orders", bytes.NewReader(bodyBytes))
		req.Header.Set("Content-Type", "application/json")
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		c.SetParamNames("slug")
		c.SetParamValues("test-shop")

		err := handler.CreatePublicOrder(c)
		if err != nil {
			t.Fatalf("CreatePublicOrder() error = %v", err)
		}

		if rec.Code != http.StatusCreated {
			t.Errorf("Expected status %d, got %d", http.StatusCreated, rec.Code)
		}

		var response map[string]interface{}
		json.Unmarshal(rec.Body.Bytes(), &response)
		
		if response["customer_email"] != "customer@example.com" {
			t.Error("Expected correct customer email in response")
		}
		if response["total"] != float64(5000) { // 2500 * 2 = 5000
			t.Errorf("Expected total 5000, got %v", response["total"])
		}

		// Verify stock was reduced
		var updatedProduct struct {
			Stock int
		}
		db.Model(&product).Select("stock").Find(&updatedProduct)
		if updatedProduct.Stock != 8 { // 10 - 2 = 8
			t.Errorf("Expected stock 8, got %d", updatedProduct.Stock)
		}
	})

	t.Run("create order with insufficient stock", func(t *testing.T) {
		testutil.CleanupDB(db)
		
		user := testutil.CreateTestUser(db, "test@example.com")
		shop := testutil.CreateTestShop(db, user, "Test Shop")
		product := testutil.CreateTestProduct(db, shop, "Test Product", 2500)
		
		reqBody := map[string]interface{}{
			"customer_email":   "customer@example.com",
			"customer_name":    "John Customer",
			"shipping_address": "123 Main St",
			"shipping_city":    "Anytown",
			"shipping_zip":     "12345",
			"items": []map[string]interface{}{
				{
					"product_id": product.ID,
					"quantity":   15, // More than available stock (10)
				},
			},
		}
		bodyBytes, _ := json.Marshal(reqBody)
		
		req := httptest.NewRequest(http.MethodPost, "/store/test-shop/orders", bytes.NewReader(bodyBytes))
		req.Header.Set("Content-Type", "application/json")
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		c.SetParamNames("slug")
		c.SetParamValues("test-shop")

		err := handler.CreatePublicOrder(c)
		if err == nil {
			t.Error("Expected error for insufficient stock")
		}

		httpErr, ok := err.(*echo.HTTPError)
		if !ok || httpErr.Code != http.StatusBadRequest {
			t.Errorf("Expected bad request error, got %v", err)
		}
	})

	t.Run("create order with missing required fields", func(t *testing.T) {
		testutil.CleanupDB(db)
		
		user := testutil.CreateTestUser(db, "test@example.com")
		shop := testutil.CreateTestShop(db, user, "Test Shop")
		
		reqBody := map[string]interface{}{
			"customer_name": "John Customer",
			// Missing email, address, etc.
		}
		bodyBytes, _ := json.Marshal(reqBody)
		
		req := httptest.NewRequest(http.MethodPost, "/store/test-shop/orders", bytes.NewReader(bodyBytes))
		req.Header.Set("Content-Type", "application/json")
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		c.SetParamNames("slug")
		c.SetParamValues("test-shop")

		err := handler.CreatePublicOrder(c)
		if err == nil {
			t.Error("Expected validation error for missing fields")
		}

		httpErr, ok := err.(*echo.HTTPError)
		if !ok || httpErr.Code != http.StatusBadRequest {
			t.Errorf("Expected bad request error, got %v", err)
		}
	})
}