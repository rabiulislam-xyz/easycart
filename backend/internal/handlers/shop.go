package handlers

import (
	"net/http"
	"regexp"
	"strings"

	"easycart/internal/models"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
)

type ShopHandler struct{
	db *gorm.DB
}

type CreateShopRequest struct {
	Name           string `json:"name" validate:"required"`
	Description    string `json:"description"`
	PrimaryColor   string `json:"primary_color"`
	SecondaryColor string `json:"secondary_color"`
}

type UpdateShopRequest struct {
	Name           string `json:"name"`
	Description    string `json:"description"`
	PrimaryColor   string `json:"primary_color"`
	SecondaryColor string `json:"secondary_color"`
}

func NewShopHandler(db *gorm.DB) *ShopHandler {
	return &ShopHandler{db: db}
}

func (h *ShopHandler) GetShop(c echo.Context) error {
	userID := c.Get("user_id").(uuid.UUID)
	
	db := h.db
	var shop models.Shop
	
	if err := db.Where("user_id = ?", userID).First(&shop).Error; err != nil {
		return echo.NewHTTPError(http.StatusNotFound, "shop not found")
	}

	return c.JSON(http.StatusOK, shop)
}

func (h *ShopHandler) CreateShop(c echo.Context) error {
	userID := c.Get("user_id").(uuid.UUID)
	
	req := new(CreateShopRequest)
	if err := c.Bind(req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid request body")
	}

	if err := c.Validate(req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	db := h.db

	// Check if user already has a shop
	var existingShop models.Shop
	if err := db.Where("user_id = ?", userID).First(&existingShop).Error; err == nil {
		return echo.NewHTTPError(http.StatusConflict, "user already has a shop")
	}

	// Generate slug from shop name
	slug := h.generateSlug(req.Name)
	
	// Ensure slug is unique
	originalSlug := slug
	counter := 1
	for {
		var existingSlugShop models.Shop
		if err := db.Where("slug = ?", slug).First(&existingSlugShop).Error; err != nil {
			break // slug is available
		}
		slug = originalSlug + "-" + string(rune(counter))
		counter++
	}

	shop := models.Shop{
		UserID:      userID,
		Name:        req.Name,
		Slug:        slug,
		Description: req.Description,
	}

	if req.PrimaryColor != "" {
		shop.PrimaryColor = req.PrimaryColor
	}
	if req.SecondaryColor != "" {
		shop.SecondaryColor = req.SecondaryColor
	}

	if err := db.Create(&shop).Error; err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to create shop")
	}

	return c.JSON(http.StatusCreated, shop)
}

func (h *ShopHandler) UpdateShop(c echo.Context) error {
	userID := c.Get("user_id").(uuid.UUID)
	
	req := new(UpdateShopRequest)
	if err := c.Bind(req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid request body")
	}

	db := h.db

	var shop models.Shop
	if err := db.Where("user_id = ?", userID).First(&shop).Error; err != nil {
		return echo.NewHTTPError(http.StatusNotFound, "shop not found")
	}

	// Update fields if provided
	if req.Name != "" {
		shop.Name = req.Name
		shop.Slug = h.generateSlug(req.Name)
		
		// Ensure new slug is unique
		originalSlug := shop.Slug
		counter := 1
		for {
			var existingSlugShop models.Shop
			if err := db.Where("slug = ? AND id != ?", shop.Slug, shop.ID).First(&existingSlugShop).Error; err != nil {
				break // slug is available
			}
			shop.Slug = originalSlug + "-" + string(rune(counter))
			counter++
		}
	}
	
	if req.Description != "" {
		shop.Description = req.Description
	}
	if req.PrimaryColor != "" {
		shop.PrimaryColor = req.PrimaryColor
	}
	if req.SecondaryColor != "" {
		shop.SecondaryColor = req.SecondaryColor
	}

	if err := db.Save(&shop).Error; err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to update shop")
	}

	return c.JSON(http.StatusOK, shop)
}

func (h *ShopHandler) generateSlug(name string) string {
	// Convert to lowercase
	slug := strings.ToLower(name)
	
	// Replace spaces and special characters with hyphens
	reg := regexp.MustCompile(`[^a-z0-9]+`)
	slug = reg.ReplaceAllString(slug, "-")
	
	// Remove leading/trailing hyphens
	slug = strings.Trim(slug, "-")
	
	return slug
}