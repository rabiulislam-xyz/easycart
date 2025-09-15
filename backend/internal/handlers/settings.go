package handlers

import (
	"net/http"

	"easycart/internal/models"
	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
)

type SettingsHandler struct {
	db *gorm.DB
}

func NewSettingsHandler(db *gorm.DB) *SettingsHandler {
	return &SettingsHandler{db: db}
}

// GetSettings returns the current shop settings
func (h *SettingsHandler) GetSettings(c echo.Context) error {
	settings, err := models.GetSettings(h.db)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to get settings: "+err.Error())
	}

	return c.JSON(http.StatusOK, settings)
}

// UpdateSettings updates the shop settings
func (h *SettingsHandler) UpdateSettings(c echo.Context) error {
	// Check if user is admin (only admin can update settings)
	user, ok := c.Get("user").(*models.User)
	if !ok || !user.IsAdmin() {
		return echo.NewHTTPError(http.StatusForbidden, "Only admin can update settings")
	}

	var req models.Settings
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid request body")
	}

	if err := c.Validate(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Validation failed: "+err.Error())
	}

	// Get current settings
	settings, err := models.GetSettings(h.db)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to get current settings: "+err.Error())
	}

	// Update only provided fields (partial update)
	if req.ShopName != "" {
		settings.ShopName = req.ShopName
	}
	if req.Description != "" {
		settings.Description = req.Description
	}
	if req.Logo != "" {
		settings.Logo = req.Logo
	}
	if req.PrimaryColor != "" {
		settings.PrimaryColor = req.PrimaryColor
	}
	if req.SecondaryColor != "" {
		settings.SecondaryColor = req.SecondaryColor
	}
	if req.ContactEmail != "" {
		settings.ContactEmail = req.ContactEmail
	}
	if req.ContactPhone != "" {
		settings.ContactPhone = req.ContactPhone
	}
	if req.Address != "" {
		settings.Address = req.Address
	}
	if req.City != "" {
		settings.City = req.City
	}
	if req.State != "" {
		settings.State = req.State
	}
	if req.ZipCode != "" {
		settings.ZipCode = req.ZipCode
	}
	if req.Country != "" {
		settings.Country = req.Country
	}
	if req.MetaTitle != "" {
		settings.MetaTitle = req.MetaTitle
	}
	if req.MetaDescription != "" {
		settings.MetaDescription = req.MetaDescription
	}

	// Update boolean fields if explicitly provided
	settings.EnableGuestCheckout = req.EnableGuestCheckout
	settings.EnableRegistration = req.EnableRegistration

	if err := h.db.Save(settings).Error; err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to update settings: "+err.Error())
	}

	return c.JSON(http.StatusOK, settings)
}