package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"easycart/internal/testutil"
	"easycart/internal/validator"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

func TestProductHandler_GetProducts(t *testing.T) {
	db, cleanup := testutil.SetupTestDB()
	defer cleanup()
	
	handler := NewProductHandler(db)
	e := echo.New()
	e.Validator = validator.New()

	t.Run("get products successfully", func(t *testing.T) {
		testutil.CleanupDB(db)
		
		user := testutil.CreateTestUser(db, "test@example.com")
		shop := testutil.CreateTestShop(db, user, "Test Shop")
		testutil.CreateTestProduct(db, shop, "Product 1", 1000)
		testutil.CreateTestProduct(db, shop, "Product 2", 2000)
		
		req := httptest.NewRequest(http.MethodGet, "/products", nil)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		c.Set("user_id", user.ID)

		err := handler.GetProducts(c)
		if err != nil {
			t.Fatalf("GetProducts() error = %v", err)
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

	t.Run("search products by name", func(t *testing.T) {
		testutil.CleanupDB(db)
		
		user := testutil.CreateTestUser(db, "test@example.com")
		shop := testutil.CreateTestShop(db, user, "Test Shop")
		testutil.CreateTestProduct(db, shop, "Apple iPhone", 99900)
		testutil.CreateTestProduct(db, shop, "Samsung Galaxy", 79900)
		
		req := httptest.NewRequest(http.MethodGet, "/products?search=Apple", nil)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		c.Set("user_id", user.ID)

		err := handler.GetProducts(c)
		if err != nil {
			t.Fatalf("GetProducts() error = %v", err)
		}

		var response map[string]interface{}
		json.Unmarshal(rec.Body.Bytes(), &response)
		
		products := response["products"].([]interface{})
		if len(products) != 1 {
			t.Errorf("Expected 1 product, got %d", len(products))
		}
	})
}

func TestProductHandler_CreateProduct(t *testing.T) {
	db, cleanup := testutil.SetupTestDB()
	defer cleanup()
	
	handler := NewProductHandler(db)
	e := echo.New()
	e.Validator = validator.New()

	t.Run("create product successfully", func(t *testing.T) {
		testutil.CleanupDB(db)
		
		user := testutil.CreateTestUser(db, "test@example.com")
		shop := testutil.CreateTestShop(db, user, "Test Shop")
		category := testutil.CreateTestCategory(db, shop, "Electronics")
		
		reqBody := map[string]interface{}{
			"name":        "New Product",
			"description": "A great product",
			"category_id": category.ID,
			"price":       2500,
			"stock":       50,
			"min_stock":   5,
			"is_active":   true,
		}
		bodyBytes, _ := json.Marshal(reqBody)
		
		req := httptest.NewRequest(http.MethodPost, "/products", bytes.NewReader(bodyBytes))
		req.Header.Set("Content-Type", "application/json")
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		c.Set("user_id", user.ID)

		err := handler.CreateProduct(c)
		if err != nil {
			t.Fatalf("CreateProduct() error = %v", err)
		}

		if rec.Code != http.StatusCreated {
			t.Errorf("Expected status %d, got %d", http.StatusCreated, rec.Code)
		}

		var response map[string]interface{}
		json.Unmarshal(rec.Body.Bytes(), &response)
		
		if response["name"] != "New Product" {
			t.Error("Expected correct product name in response")
		}
		if response["price"] != float64(2500) {
			t.Error("Expected correct price in response")
		}
	})

	t.Run("create product with missing required fields", func(t *testing.T) {
		testutil.CleanupDB(db)
		
		user := testutil.CreateTestUser(db, "test@example.com")
		testutil.CreateTestShop(db, user, "Test Shop")
		
		reqBody := map[string]interface{}{
			"description": "Missing name and price",
			"stock":       10,
		}
		bodyBytes, _ := json.Marshal(reqBody)
		
		req := httptest.NewRequest(http.MethodPost, "/products", bytes.NewReader(bodyBytes))
		req.Header.Set("Content-Type", "application/json")
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		c.Set("user_id", user.ID)

		err := handler.CreateProduct(c)
		if err == nil {
			t.Error("Expected validation error for missing required fields")
		}

		httpErr, ok := err.(*echo.HTTPError)
		if !ok || httpErr.Code != http.StatusBadRequest {
			t.Errorf("Expected bad request error, got %v", err)
		}
	})
}

func TestProductHandler_UpdateProduct(t *testing.T) {
	db, cleanup := testutil.SetupTestDB()
	defer cleanup()
	
	handler := NewProductHandler(db)
	e := echo.New()
	e.Validator = validator.New()

	t.Run("update product successfully", func(t *testing.T) {
		testutil.CleanupDB(db)
		
		user := testutil.CreateTestUser(db, "test@example.com")
		shop := testutil.CreateTestShop(db, user, "Test Shop")
		product := testutil.CreateTestProduct(db, shop, "Original Product", 1000)
		
		reqBody := map[string]interface{}{
			"name":  "Updated Product",
			"price": 1500,
		}
		bodyBytes, _ := json.Marshal(reqBody)
		
		req := httptest.NewRequest(http.MethodPUT, "/products/"+product.ID.String(), bytes.NewReader(bodyBytes))
		req.Header.Set("Content-Type", "application/json")
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		c.SetParamNames("id")
		c.SetParamValues(product.ID.String())
		c.Set("user_id", user.ID)

		err := handler.UpdateProduct(c)
		if err != nil {
			t.Fatalf("UpdateProduct() error = %v", err)
		}

		if rec.Code != http.StatusOK {
			t.Errorf("Expected status %d, got %d", http.StatusOK, rec.Code)
		}

		var response map[string]interface{}
		json.Unmarshal(rec.Body.Bytes(), &response)
		
		if response["name"] != "Updated Product" {
			t.Error("Expected updated product name in response")
		}
	})

	t.Run("update nonexistent product", func(t *testing.T) {
		testutil.CleanupDB(db)
		
		user := testutil.CreateTestUser(db, "test@example.com")
		testutil.CreateTestShop(db, user, "Test Shop")
		
		fakeID := uuid.New()
		reqBody := map[string]interface{}{"name": "Updated"}
		bodyBytes, _ := json.Marshal(reqBody)
		
		req := httptest.NewRequest(http.MethodPUT, "/products/"+fakeID.String(), bytes.NewReader(bodyBytes))
		req.Header.Set("Content-Type", "application/json")
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		c.SetParamNames("id")
		c.SetParamValues(fakeID.String())
		c.Set("user_id", user.ID)

		err := handler.UpdateProduct(c)
		if err == nil {
			t.Error("Expected error for nonexistent product")
		}

		httpErr, ok := err.(*echo.HTTPError)
		if !ok || httpErr.Code != http.StatusNotFound {
			t.Errorf("Expected not found error, got %v", err)
		}
	})
}