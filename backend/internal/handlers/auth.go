package handlers

import (
	"net/http"
	"strings"
	"time"

	"easycart/internal/middleware"
	"easycart/internal/models"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
)

type AuthHandler struct {
	db        *gorm.DB
	JWTSecret string
}

type RegisterRequest struct {
	Email     string `json:"email" validate:"required,email"`
	Password  string `json:"password" validate:"required,min=6"`
	FirstName string `json:"first_name" validate:"required"`
	LastName  string `json:"last_name" validate:"required"`
}

type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

type AuthResponse struct {
	User  models.UserResponse `json:"user"`
	Token string              `json:"token"`
}

func NewAuthHandler(db *gorm.DB, jwtSecret string) *AuthHandler {
	return &AuthHandler{db: db, JWTSecret: jwtSecret}
}

func (h *AuthHandler) Register(c echo.Context) error {
	req := new(RegisterRequest)
	if err := c.Bind(req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid request body")
	}

	if err := c.Validate(req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	db := h.db

	// Check if user already exists
	var existingUser models.User
	if err := db.Where("email = ?", strings.ToLower(req.Email)).First(&existingUser).Error; err == nil {
		return echo.NewHTTPError(http.StatusConflict, "user with this email already exists")
	}

	// Create new user with customer role
	user := models.User{
		Email:     strings.ToLower(req.Email),
		FirstName: req.FirstName,
		LastName:  req.LastName,
		Role:      models.UserRoleCustomer,
		IsActive:  true,
	}

	if err := user.HashPassword(req.Password); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to hash password")
	}

	if err := db.Create(&user).Error; err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to create user")
	}

	// Generate JWT token
	token, err := h.generateToken(user.ID, user.Email)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to generate token")
	}

	return c.JSON(http.StatusCreated, AuthResponse{
		User:  user.ToResponse(),
		Token: token,
	})
}

func (h *AuthHandler) Login(c echo.Context) error {
	req := new(LoginRequest)
	if err := c.Bind(req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid request body")
	}

	if err := c.Validate(req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	db := h.db

	var user models.User
	if err := db.Where("email = ?", strings.ToLower(req.Email)).First(&user).Error; err != nil {
		return echo.NewHTTPError(http.StatusUnauthorized, "invalid credentials")
	}

	if err := user.CheckPassword(req.Password); err != nil {
		return echo.NewHTTPError(http.StatusUnauthorized, "invalid credentials")
	}

	// Reload user to get complete data
	db.First(&user, user.ID)

	// Generate JWT token
	token, err := h.generateToken(user.ID, user.Email)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to generate token")
	}

	return c.JSON(http.StatusOK, AuthResponse{
		User:  user.ToResponse(),
		Token: token,
	})
}

func (h *AuthHandler) GetProfile(c echo.Context) error {
	userID := c.Get("user_id").(uuid.UUID)
	
	db := h.db
	var user models.User
	
	if err := db.First(&user, userID).Error; err != nil {
		return echo.NewHTTPError(http.StatusNotFound, "user not found")
	}

	return c.JSON(http.StatusOK, user.ToResponse())
}

func (h *AuthHandler) generateToken(userID uuid.UUID, email string) (string, error) {
	claims := &middleware.JWTClaims{
		UserID: userID,
		Email:  email,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(h.JWTSecret))
}