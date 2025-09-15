package handlers

import (
	"fmt"
	"net/http"
	"regexp"
	"strconv"
	"strings"

	"easycart/internal/models"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
)

type ProductHandler struct{
	db *gorm.DB
}

type CreateProductRequest struct {
	Name         string     `json:"name" validate:"required"`
	Description  string     `json:"description"`
	CategoryID   *uuid.UUID `json:"category_id,omitempty"`
	Price        int        `json:"price" validate:"required,min=0"`
	ComparePrice *int       `json:"compare_price,omitempty"`
	Stock        int        `json:"stock" validate:"min=0"`
	MinStock     int        `json:"min_stock" validate:"min=0"`
	Weight       *float64   `json:"weight,omitempty"`
	IsActive     *bool      `json:"is_active,omitempty"`
	IsFeatured   *bool      `json:"is_featured,omitempty"`
	ImageIDs     []uuid.UUID `json:"image_ids,omitempty"`
}

type UpdateProductRequest struct {
	Name         string     `json:"name"`
	Description  string     `json:"description"`
	CategoryID   *uuid.UUID `json:"category_id,omitempty"`
	Price        *int       `json:"price,omitempty"`
	ComparePrice *int       `json:"compare_price,omitempty"`
	Stock        *int       `json:"stock,omitempty"`
	MinStock     *int       `json:"min_stock,omitempty"`
	Weight       *float64   `json:"weight,omitempty"`
	IsActive     *bool      `json:"is_active,omitempty"`
	IsFeatured   *bool      `json:"is_featured,omitempty"`
	ImageIDs     []uuid.UUID `json:"image_ids,omitempty"`
}

func NewProductHandler(db *gorm.DB) *ProductHandler {
	return &ProductHandler{db: db}
}

func (h *ProductHandler) GetProducts(c echo.Context) error {
	userID := c.Get("user_id").(uuid.UUID)

	db := h.db

	// Get user's shop
	var shop models.Shop
	if err := db.Where("user_id = ?", userID).First(&shop).Error; err != nil {
		return echo.NewHTTPError(http.StatusNotFound, "shop not found")
	}

	// Parse query parameters
	page, _ := strconv.Atoi(c.QueryParam("page"))
	if page < 1 {
		page = 1
	}
	limit, _ := strconv.Atoi(c.QueryParam("limit"))
	if limit < 1 || limit > 100 {
		limit = 20
	}
	search := c.QueryParam("search")
	categoryID := c.QueryParam("category_id")

	query := db.Where("shop_id = ?", shop.ID).
		Preload("Category").
		Preload("Images")

	// Apply search filter
	if search != "" {
		query = query.Where("name ILIKE ? OR description ILIKE ? OR sku ILIKE ?",
			"%"+search+"%", "%"+search+"%", "%"+search+"%")
	}

	// Apply category filter
	if categoryID != "" {
		if catUUID, err := uuid.Parse(categoryID); err == nil {
			query = query.Where("category_id = ?", catUUID)
		}
	}

	// Count total records
	var total int64
	query.Model(&models.Product{}).Count(&total)

	// Get paginated results
	var products []models.Product
	offset := (page - 1) * limit
	if err := query.Offset(offset).Limit(limit).Order("created_at DESC").Find(&products).Error; err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to fetch products")
	}

	// Convert to response format
	var productResponses []models.ProductResponse
	for _, product := range products {
		productResponses = append(productResponses, product.ToResponse())
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"products": productResponses,
		"pagination": map[string]interface{}{
			"page":       page,
			"limit":      limit,
			"total":      total,
			"total_pages": (total + int64(limit) - 1) / int64(limit),
		},
	})
}

func (h *ProductHandler) GetProduct(c echo.Context) error {
	userID := c.Get("user_id").(uuid.UUID)
	productID := c.Param("id")

	productUUID, err := uuid.Parse(productID)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid product ID")
	}

	db := h.db

	// Get user's shop
	var shop models.Shop
	if err := db.Where("user_id = ?", userID).First(&shop).Error; err != nil {
		return echo.NewHTTPError(http.StatusNotFound, "shop not found")
	}

	// Get product
	var product models.Product
	if err := db.Where("id = ? AND shop_id = ?", productUUID, shop.ID).
		Preload("Category").
		Preload("Images").
		First(&product).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return echo.NewHTTPError(http.StatusNotFound, "product not found")
		}
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to fetch product")
	}

	return c.JSON(http.StatusOK, product.ToResponse())
}

func (h *ProductHandler) CreateProduct(c echo.Context) error {
	userID := c.Get("user_id").(uuid.UUID)

	req := new(CreateProductRequest)
	if err := c.Bind(req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid request body")
	}

	if err := c.Validate(req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	db := h.db

	// Get user's shop
	var shop models.Shop
	if err := db.Where("user_id = ?", userID).First(&shop).Error; err != nil {
		return echo.NewHTTPError(http.StatusNotFound, "shop not found")
	}

	// Validate category belongs to shop if provided
	if req.CategoryID != nil {
		var category models.Category
		if err := db.Where("id = ? AND shop_id = ?", *req.CategoryID, shop.ID).First(&category).Error; err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, "invalid category")
		}
	}

	// Generate SKU
	sku := h.generateSKU(req.Name, shop.ID.String()[:8])

	// Ensure SKU is unique
	originalSKU := sku
	counter := 1
	for {
		var existingProduct models.Product
		if err := db.Where("sku = ?", sku).First(&existingProduct).Error; err != nil {
			break // SKU is available
		}
		sku = fmt.Sprintf("%s-%d", originalSKU, counter)
		counter++
	}

	// Create product
	product := models.Product{
		CategoryID:  req.CategoryID,
		Name:        req.Name,
		Slug:        h.generateSlug(req.Name),
		Description: req.Description,
		SKU:         sku,
		Price:       req.Price,
		ComparePrice: req.ComparePrice,
		Stock:       req.Stock,
		MinStock:    req.MinStock,
		Weight:      req.Weight,
		IsActive:    true,
		IsFeatured:  false,
	}

	if req.IsActive != nil {
		product.IsActive = *req.IsActive
	}
	if req.IsFeatured != nil {
		product.IsFeatured = *req.IsFeatured
	}

	// Ensure slug is unique
	originalSlug := product.Slug
	counter = 1
	for {
		var existingProduct models.Product
		if err := db.Where("slug = ? AND shop_id = ?", product.Slug, shop.ID).First(&existingProduct).Error; err != nil {
			break // slug is available
		}
		product.Slug = fmt.Sprintf("%s-%d", originalSlug, counter)
		counter++
	}

	if err := db.Create(&product).Error; err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to create product")
	}

	// Associate images if provided
	if len(req.ImageIDs) > 0 {
		for i, imageID := range req.ImageIDs {
			db.Model(&models.Media{}).
				Where("id = ? AND shop_id = ? AND product_id IS NULL", imageID, shop.ID).
				Updates(map[string]interface{}{
					"product_id": product.ID,
					"sort_order": i,
				})
		}
	}

	// Load the created product with associations
	db.Preload("Category").Preload("Images").First(&product, product.ID)

	return c.JSON(http.StatusCreated, product.ToResponse())
}

func (h *ProductHandler) UpdateProduct(c echo.Context) error {
	userID := c.Get("user_id").(uuid.UUID)
	productID := c.Param("id")

	productUUID, err := uuid.Parse(productID)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid product ID")
	}

	req := new(UpdateProductRequest)
	if err := c.Bind(req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid request body")
	}

	db := h.db

	// Get user's shop
	var shop models.Shop
	if err := db.Where("user_id = ?", userID).First(&shop).Error; err != nil {
		return echo.NewHTTPError(http.StatusNotFound, "shop not found")
	}

	// Get existing product
	var product models.Product
	if err := db.Where("id = ? AND shop_id = ?", productUUID, shop.ID).First(&product).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return echo.NewHTTPError(http.StatusNotFound, "product not found")
		}
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to fetch product")
	}

	// Update fields
	if req.Name != "" {
		product.Name = req.Name
		product.Slug = h.generateSlug(req.Name)

		// Ensure new slug is unique
		originalSlug := product.Slug
		counter := 1
		for {
			var existingProduct models.Product
			if err := db.Where("slug = ? AND shop_id = ? AND id != ?", product.Slug, shop.ID, product.ID).First(&existingProduct).Error; err != nil {
				break // slug is available
			}
			product.Slug = fmt.Sprintf("%s-%d", originalSlug, counter)
			counter++
		}
	}

	if req.Description != "" {
		product.Description = req.Description
	}

	if req.CategoryID != nil {
		// Validate category belongs to shop
		var category models.Category
		if err := db.Where("id = ? AND shop_id = ?", *req.CategoryID, shop.ID).First(&category).Error; err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, "invalid category")
		}
		product.CategoryID = req.CategoryID
	}

	if req.Price != nil {
		product.Price = *req.Price
	}
	if req.ComparePrice != nil {
		product.ComparePrice = req.ComparePrice
	}
	if req.Stock != nil {
		product.Stock = *req.Stock
	}
	if req.MinStock != nil {
		product.MinStock = *req.MinStock
	}
	if req.Weight != nil {
		product.Weight = req.Weight
	}
	if req.IsActive != nil {
		product.IsActive = *req.IsActive
	}
	if req.IsFeatured != nil {
		product.IsFeatured = *req.IsFeatured
	}

	if err := db.Save(&product).Error; err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to update product")
	}

	// Update image associations if provided
	if len(req.ImageIDs) > 0 {
		// Clear existing associations
		db.Model(&models.Media{}).
			Where("product_id = ?", product.ID).
			Updates(map[string]interface{}{
				"product_id": nil,
				"sort_order": 0,
			})

		// Set new associations
		for i, imageID := range req.ImageIDs {
			db.Model(&models.Media{}).
				Where("id = ? AND shop_id = ?", imageID, shop.ID).
				Updates(map[string]interface{}{
					"product_id": product.ID,
					"sort_order": i,
				})
		}
	}

	// Load updated product with associations
	db.Preload("Category").Preload("Images").First(&product, product.ID)

	return c.JSON(http.StatusOK, product.ToResponse())
}

func (h *ProductHandler) DeleteProduct(c echo.Context) error {
	userID := c.Get("user_id").(uuid.UUID)
	productID := c.Param("id")

	productUUID, err := uuid.Parse(productID)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid product ID")
	}

	db := h.db

	// Get user's shop
	var shop models.Shop
	if err := db.Where("user_id = ?", userID).First(&shop).Error; err != nil {
		return echo.NewHTTPError(http.StatusNotFound, "shop not found")
	}

	// Delete product (associated images will be unlinked due to FK constraints)
	result := db.Where("id = ? AND shop_id = ?", productUUID, shop.ID).Delete(&models.Product{})
	if result.Error != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to delete product")
	}

	if result.RowsAffected == 0 {
		return echo.NewHTTPError(http.StatusNotFound, "product not found")
	}

	return c.NoContent(http.StatusNoContent)
}

func (h *ProductHandler) generateSKU(productName, shopPrefix string) string {
	// Create SKU from product name + shop prefix
	name := strings.ToUpper(regexp.MustCompile(`[^a-zA-Z0-9]+`).ReplaceAllString(productName, ""))
	if len(name) > 10 {
		name = name[:10]
	}
	return fmt.Sprintf("%s-%s", strings.ToUpper(shopPrefix), name)
}

func (h *ProductHandler) generateSlug(name string) string {
	slug := strings.ToLower(name)
	reg := regexp.MustCompile(`[^a-z0-9]+`)
	slug = reg.ReplaceAllString(slug, "-")
	slug = strings.Trim(slug, "-")
	return slug
}