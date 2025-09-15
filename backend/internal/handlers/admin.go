package handlers

import (
	"net/http"

	"easycart/internal/models"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
)

type AdminHandler struct {
	db *gorm.DB
}

func NewAdminHandler(db *gorm.DB) *AdminHandler {
	return &AdminHandler{db: db}
}

// GetUsers returns all users (admin/manager only)
func (h *AdminHandler) GetUsers(c echo.Context) error {
	user, ok := c.Get("user").(*models.User)
	if !ok || !user.IsAdmin() {
		return echo.NewHTTPError(http.StatusForbidden, "Only admin can view users")
	}

	var users []models.User
	if err := h.db.Find(&users).Error; err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to get users: "+err.Error())
	}

	var response []models.UserResponse
	for _, u := range users {
		response = append(response, u.ToResponse())
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"users": response,
		"total": len(response),
	})
}

type CreateUserRequest struct {
	Email     string          `json:"email" validate:"required,email"`
	Password  string          `json:"password" validate:"required,min=6"`
	FirstName string          `json:"first_name" validate:"required"`
	LastName  string          `json:"last_name" validate:"required"`
	Role      models.UserRole `json:"role" validate:"required"`
}

// CreateUser creates a new user (admin only)
func (h *AdminHandler) CreateUser(c echo.Context) error {
	user, ok := c.Get("user").(*models.User)
	if !ok || !user.IsAdmin() {
		return echo.NewHTTPError(http.StatusForbidden, "Only admin can create users")
	}

	var req CreateUserRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid request body")
	}

	if err := c.Validate(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Validation failed: "+err.Error())
	}

	// Validate role
	if req.Role != models.UserRoleAdmin && req.Role != models.UserRoleManager && req.Role != models.UserRoleCustomer {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid role")
	}

	// Check if email already exists
	var existingUser models.User
	if err := h.db.Where("email = ?", req.Email).First(&existingUser).Error; err == nil {
		return echo.NewHTTPError(http.StatusConflict, "Email already exists")
	}

	newUser := models.User{
		Email:     req.Email,
		FirstName: req.FirstName,
		LastName:  req.LastName,
		Role:      req.Role,
		IsActive:  true,
	}

	if err := newUser.HashPassword(req.Password); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to hash password")
	}

	if err := h.db.Create(&newUser).Error; err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to create user: "+err.Error())
	}

	return c.JSON(http.StatusCreated, newUser.ToResponse())
}

type UpdateUserRequest struct {
	Email     string          `json:"email" validate:"omitempty,email"`
	FirstName string          `json:"first_name"`
	LastName  string          `json:"last_name"`
	Role      models.UserRole `json:"role"`
	IsActive  *bool           `json:"is_active"`
}

// UpdateUser updates a user (admin only)
func (h *AdminHandler) UpdateUser(c echo.Context) error {
	currentUser, ok := c.Get("user").(*models.User)
	if !ok || !currentUser.IsAdmin() {
		return echo.NewHTTPError(http.StatusForbidden, "Only admin can update users")
	}

	userID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid user ID")
	}

	var req UpdateUserRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid request body")
	}

	if err := c.Validate(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Validation failed: "+err.Error())
	}

	var user models.User
	if err := h.db.First(&user, userID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return echo.NewHTTPError(http.StatusNotFound, "User not found")
		}
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to get user: "+err.Error())
	}

	// Prevent admin from deactivating themselves
	if user.ID == currentUser.ID && req.IsActive != nil && !*req.IsActive {
		return echo.NewHTTPError(http.StatusBadRequest, "Cannot deactivate yourself")
	}

	// Update fields
	if req.Email != "" {
		// Check if new email already exists
		var existingUser models.User
		if err := h.db.Where("email = ? AND id != ?", req.Email, userID).First(&existingUser).Error; err == nil {
			return echo.NewHTTPError(http.StatusConflict, "Email already exists")
		}
		user.Email = req.Email
	}
	if req.FirstName != "" {
		user.FirstName = req.FirstName
	}
	if req.LastName != "" {
		user.LastName = req.LastName
	}
	if req.Role != "" {
		if req.Role != models.UserRoleAdmin && req.Role != models.UserRoleManager && req.Role != models.UserRoleCustomer {
			return echo.NewHTTPError(http.StatusBadRequest, "Invalid role")
		}
		user.Role = req.Role
	}
	if req.IsActive != nil {
		user.IsActive = *req.IsActive
	}

	if err := h.db.Save(&user).Error; err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to update user: "+err.Error())
	}

	return c.JSON(http.StatusOK, user.ToResponse())
}

// DeleteUser soft deletes a user (admin only)
func (h *AdminHandler) DeleteUser(c echo.Context) error {
	currentUser, ok := c.Get("user").(*models.User)
	if !ok || !currentUser.IsAdmin() {
		return echo.NewHTTPError(http.StatusForbidden, "Only admin can delete users")
	}

	userID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid user ID")
	}

	// Prevent admin from deleting themselves
	if userID == currentUser.ID {
		return echo.NewHTTPError(http.StatusBadRequest, "Cannot delete yourself")
	}

	var user models.User
	if err := h.db.First(&user, userID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return echo.NewHTTPError(http.StatusNotFound, "User not found")
		}
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to get user: "+err.Error())
	}

	if err := h.db.Delete(&user).Error; err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to delete user: "+err.Error())
	}

	return c.JSON(http.StatusOK, map[string]string{
		"message": "User deleted successfully",
	})
}