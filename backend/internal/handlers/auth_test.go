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
	"gorm.io/gorm"
)

func TestAuthHandler_Register(t *testing.T) {
	db, cleanup := testutil.SetupTestDB()
	defer cleanup()
	
	handler := NewAuthHandler(db, "test-secret")
	e := echo.New()
	e.Validator = validator.New()

	t.Run("successful registration", func(t *testing.T) {
		testutil.CleanupDB(db)
		
		reqBody := map[string]string{
			"email":      "test@example.com",
			"password":   "password123",
			"first_name": "John",
			"last_name":  "Doe",
		}
		bodyBytes, _ := json.Marshal(reqBody)
		
		req := httptest.NewRequest(http.MethodPost, "/auth/register", bytes.NewReader(bodyBytes))
		req.Header.Set("Content-Type", "application/json")
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		err := handler.Register(c)
		if err != nil {
			t.Fatalf("Register() error = %v", err)
		}

		if rec.Code != http.StatusCreated {
			t.Errorf("Expected status %d, got %d", http.StatusCreated, rec.Code)
		}

		var response map[string]interface{}
		json.Unmarshal(rec.Body.Bytes(), &response)
		
		if response["token"] == nil {
			t.Error("Expected token in response")
		}
		if response["user"] == nil {
			t.Error("Expected user in response")
		}
	})

	t.Run("duplicate email registration", func(t *testing.T) {
		testutil.CleanupDB(db)
		testutil.CreateTestUser(db, "existing@example.com")
		
		reqBody := map[string]string{
			"email":      "existing@example.com",
			"password":   "password123", 
			"first_name": "Jane",
			"last_name":  "Doe",
		}
		bodyBytes, _ := json.Marshal(reqBody)
		
		req := httptest.NewRequest(http.MethodPost, "/auth/register", bytes.NewReader(bodyBytes))
		req.Header.Set("Content-Type", "application/json")
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		err := handler.Register(c)
		if err == nil {
			t.Error("Expected error for duplicate email")
		}

		httpErr, ok := err.(*echo.HTTPError)
		if !ok || httpErr.Code != http.StatusConflict {
			t.Errorf("Expected conflict error, got %v", err)
		}
	})

	t.Run("invalid email format", func(t *testing.T) {
		reqBody := map[string]string{
			"email":      "invalid-email",
			"password":   "password123",
			"first_name": "John",
			"last_name":  "Doe",
		}
		bodyBytes, _ := json.Marshal(reqBody)
		
		req := httptest.NewRequest(http.MethodPost, "/auth/register", bytes.NewReader(bodyBytes))
		req.Header.Set("Content-Type", "application/json") 
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		err := handler.Register(c)
		if err == nil {
			t.Error("Expected validation error for invalid email")
		}
	})
}

func TestAuthHandler_Login(t *testing.T) {
	db, cleanup := testutil.SetupTestDB()
	defer cleanup()
	
	handler := NewAuthHandler(db, "test-secret")
	e := echo.New()
	e.Validator = validator.New()

	t.Run("successful login", func(t *testing.T) {
		testutil.CleanupDB(db)
		testutil.CreateTestUser(db, "login@example.com")
		
		reqBody := map[string]string{
			"email":    "login@example.com",
			"password": "password123",
		}
		bodyBytes, _ := json.Marshal(reqBody)
		
		req := httptest.NewRequest(http.MethodPost, "/auth/login", bytes.NewReader(bodyBytes))
		req.Header.Set("Content-Type", "application/json")
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		err := handler.Login(c)
		if err != nil {
			t.Fatalf("Login() error = %v", err)
		}

		if rec.Code != http.StatusOK {
			t.Errorf("Expected status %d, got %d", http.StatusOK, rec.Code)
		}

		var response map[string]interface{}
		json.Unmarshal(rec.Body.Bytes(), &response)
		
		if response["token"] == nil {
			t.Error("Expected token in response")
		}
	})

	t.Run("invalid credentials", func(t *testing.T) {
		testutil.CleanupDB(db)
		testutil.CreateTestUser(db, "login@example.com")
		
		reqBody := map[string]string{
			"email":    "login@example.com",
			"password": "wrongpassword",
		}
		bodyBytes, _ := json.Marshal(reqBody)
		
		req := httptest.NewRequest(http.MethodPost, "/auth/login", bytes.NewReader(bodyBytes))
		req.Header.Set("Content-Type", "application/json")
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		err := handler.Login(c)
		if err == nil {
			t.Error("Expected error for invalid credentials")
		}

		httpErr, ok := err.(*echo.HTTPError)
		if !ok || httpErr.Code != http.StatusUnauthorized {
			t.Errorf("Expected unauthorized error, got %v", err)
		}
	})

	t.Run("nonexistent user", func(t *testing.T) {
		testutil.CleanupDB(db)
		
		reqBody := map[string]string{
			"email":    "nonexistent@example.com",
			"password": "password123",
		}
		bodyBytes, _ := json.Marshal(reqBody)
		
		req := httptest.NewRequest(http.MethodPost, "/auth/login", bytes.NewReader(bodyBytes))
		req.Header.Set("Content-Type", "application/json")
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		err := handler.Login(c)
		if err == nil {
			t.Error("Expected error for nonexistent user")
		}

		httpErr, ok := err.(*echo.HTTPError)
		if !ok || httpErr.Code != http.StatusUnauthorized {
			t.Errorf("Expected unauthorized error, got %v", err)
		}
	})
}