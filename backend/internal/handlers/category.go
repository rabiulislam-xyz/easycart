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

type CategoryHandler struct{
	db *gorm.DB
}

type CreateCategoryRequest struct {
	Name        string `json:"name" validate:"required"`
	Description string `json:"description"`
	ImageID     *uuid.UUID `json:"image_id,omitempty"`
}

type UpdateCategoryRequest struct {
	Name        string     `json:"name"`
	Description string     `json:"description"`
	ImageID     *uuid.UUID `json:"image_id,omitempty"`
	IsActive    *bool      `json:"is_active,omitempty"`
}

func NewCategoryHandler(db *gorm.DB) *CategoryHandler {
	return &CategoryHandler{db: db}
}

func (h *CategoryHandler) GetCategories(c echo.Context) error {
	db := h.db

	var categories []models.Category
	if err := db.Order("name ASC").Find(&categories).Error; err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to fetch categories")
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"categories": categories,
	})
}

func (h *CategoryHandler) GetCategory(c echo.Context) error {
	categoryID := c.Param("id")

	categoryUUID, err := uuid.Parse(categoryID)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid category ID")
	}

	db := h.db

	var category models.Category
	if err := db.Where("id = ?", categoryUUID).First(&category).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return echo.NewHTTPError(http.StatusNotFound, "category not found")
		}
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to fetch category")
	}

	return c.JSON(http.StatusOK, category)
}

func (h *CategoryHandler) CreateCategory(c echo.Context) error {
	req := new(CreateCategoryRequest)
	if err := c.Bind(req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid request body")
	}

	if err := c.Validate(req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	db := h.db

	// Generate slug
	slug := h.generateSlug(req.Name)

	// Ensure slug is unique
	originalSlug := slug
	counter := 1
	for {
		var existingCategory models.Category
		if err := db.Where("slug = ?", slug).First(&existingCategory).Error; err != nil {
			break // slug is available
		}
		slug = originalSlug + "-" + string(rune(counter))
		counter++
	}

	// Get image URL if image ID is provided
	var imageURL string
	if req.ImageID != nil {
		var media models.Media
		if err := db.Where("id = ?", *req.ImageID).First(&media).Error; err == nil {
			imageURL = media.URL
		}
	}

	category := models.Category{
		Name:        req.Name,
		Slug:        slug,
		Description: req.Description,
		ImageURL:    imageURL,
		IsActive:    true,
	}

	if err := db.Create(&category).Error; err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to create category")
	}

	return c.JSON(http.StatusCreated, category)
}

func (h *CategoryHandler) UpdateCategory(c echo.Context) error {
	categoryID := c.Param("id")

	categoryUUID, err := uuid.Parse(categoryID)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid category ID")
	}

	req := new(UpdateCategoryRequest)
	if err := c.Bind(req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid request body")
	}

	db := h.db

	// Get existing category
	var category models.Category
	if err := db.Where("id = ?", categoryUUID).First(&category).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return echo.NewHTTPError(http.StatusNotFound, "category not found")
		}
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to fetch category")
	}

	// Update fields
	if req.Name != "" {
		category.Name = req.Name
		category.Slug = h.generateSlug(req.Name)

		// Ensure new slug is unique
		originalSlug := category.Slug
		counter := 1
		for {
			var existingCategory models.Category
			if err := db.Where("slug = ? AND id != ?", category.Slug, category.ID).First(&existingCategory).Error; err != nil {
				break // slug is available
			}
			category.Slug = originalSlug + "-" + string(rune(counter))
			counter++
		}
	}

	if req.Description != "" {
		category.Description = req.Description
	}

	if req.ImageID != nil {
		// Get image URL
		var media models.Media
		if err := db.Where("id = ?", *req.ImageID).First(&media).Error; err == nil {
			category.ImageURL = media.URL
		}
	}

	if req.IsActive != nil {
		category.IsActive = *req.IsActive
	}

	if err := db.Save(&category).Error; err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to update category")
	}

	return c.JSON(http.StatusOK, category)
}

func (h *CategoryHandler) DeleteCategory(c echo.Context) error {
	categoryID := c.Param("id")

	categoryUUID, err := uuid.Parse(categoryID)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid category ID")
	}

	db := h.db

	// Check if category has products
	var productCount int64
	db.Model(&models.Product{}).Where("category_id = ?", categoryUUID).Count(&productCount)
	if productCount > 0 {
		return echo.NewHTTPError(http.StatusBadRequest, "cannot delete category with products")
	}

	// Delete category
	result := db.Where("id = ?", categoryUUID).Delete(&models.Category{})
	if result.Error != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to delete category")
	}

	if result.RowsAffected == 0 {
		return echo.NewHTTPError(http.StatusNotFound, "category not found")
	}

	return c.NoContent(http.StatusNoContent)
}

func (h *CategoryHandler) generateSlug(name string) string {
	slug := strings.ToLower(name)
	reg := regexp.MustCompile(`[^a-z0-9]+`)
	slug = reg.ReplaceAllString(slug, "-")
	slug = strings.Trim(slug, "-")
	return slug
}