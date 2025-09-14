package handlers

import (
	"net/http"
	"strconv"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
	"gorm.io/gorm"

	"easycart/internal/models"
)

type StorefrontHandler struct {
	db *gorm.DB
}

func NewStorefrontHandler(db *gorm.DB) *StorefrontHandler {
	return &StorefrontHandler{db: db}
}

// GetShop gets a shop by slug (public endpoint)
func (h *StorefrontHandler) GetShop(c echo.Context) error {
	slug := c.Param("slug")

	var shop models.Shop
	if err := h.db.Where("slug = ?", slug).First(&shop).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.JSON(http.StatusNotFound, map[string]string{"error": "Shop not found"})
		}
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Database error"})
	}

	return c.JSON(http.StatusOK, shop)
}

// GetShopProducts gets products for a shop (public endpoint)
func (h *StorefrontHandler) GetShopProducts(c echo.Context) error {
	slug := c.Param("slug")

	// Get shop first
	var shop models.Shop
	if err := h.db.Where("slug = ?", slug).First(&shop).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.JSON(http.StatusNotFound, map[string]string{"error": "Shop not found"})
		}
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Database error"})
	}

	page, _ := strconv.Atoi(c.QueryParam("page"))
	if page < 1 {
		page = 1
	}
	limit, _ := strconv.Atoi(c.QueryParam("limit"))
	if limit < 1 || limit > 50 {
		limit = 12
	}

	search := c.QueryParam("search")
	categoryID := c.QueryParam("category_id")

	query := h.db.Where("shop_id = ? AND is_active = true", shop.ID)

	if search != "" {
		query = query.Where("name ILIKE ? OR description ILIKE ?", "%"+search+"%", "%"+search+"%")
	}

	if categoryID != "" {
		if catID, err := uuid.Parse(categoryID); err == nil {
			query = query.Where("category_id = ?", catID)
		}
	}

	var total int64
	query.Model(&models.Product{}).Count(&total)

	var products []models.Product
	offset := (page - 1) * limit
	
	if err := query.Preload("Category").Preload("Media").Order("created_at DESC").Offset(offset).Limit(limit).Find(&products).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Database error"})
	}

	totalPages := int((total + int64(limit) - 1) / int64(limit))

	response := map[string]interface{}{
		"products": products,
		"pagination": map[string]interface{}{
			"page":        page,
			"limit":       limit,
			"total":       total,
			"total_pages": totalPages,
		},
	}

	return c.JSON(http.StatusOK, response)
}

// GetShopProduct gets a single product for a shop (public endpoint)
func (h *StorefrontHandler) GetShopProduct(c echo.Context) error {
	slug := c.Param("slug")
	productID := c.Param("productId")

	// Get shop first
	var shop models.Shop
	if err := h.db.Where("slug = ?", slug).First(&shop).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.JSON(http.StatusNotFound, map[string]string{"error": "Shop not found"})
		}
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Database error"})
	}

	// Parse product ID
	id, err := uuid.Parse(productID)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid product ID"})
	}

	var product models.Product
	if err := h.db.Preload("Category").Preload("Media").Where("id = ? AND shop_id = ? AND is_active = true", id, shop.ID).First(&product).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.JSON(http.StatusNotFound, map[string]string{"error": "Product not found"})
		}
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Database error"})
	}

	return c.JSON(http.StatusOK, product)
}

// GetShopCategories gets categories for a shop (public endpoint)
func (h *StorefrontHandler) GetShopCategories(c echo.Context) error {
	slug := c.Param("slug")

	// Get shop first
	var shop models.Shop
	if err := h.db.Where("slug = ?", slug).First(&shop).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.JSON(http.StatusNotFound, map[string]string{"error": "Shop not found"})
		}
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Database error"})
	}

	var categories []models.Category
	if err := h.db.Where("shop_id = ?", shop.ID).Order("name ASC").Find(&categories).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Database error"})
	}

	response := map[string]interface{}{
		"categories": categories,
	}

	return c.JSON(http.StatusOK, response)
}

// CreatePublicOrder creates an order from the storefront (public endpoint)
func (h *StorefrontHandler) CreatePublicOrder(c echo.Context) error {
	slug := c.Param("slug")

	// Get shop first
	var shop models.Shop
	if err := h.db.Where("slug = ?", slug).First(&shop).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.JSON(http.StatusNotFound, map[string]string{"error": "Shop not found"})
		}
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Database error"})
	}

	var req struct {
		CustomerEmail   string `json:"customer_email" validate:"required,email"`
		CustomerName    string `json:"customer_name" validate:"required"`
		CustomerPhone   string `json:"customer_phone"`
		ShippingAddress string `json:"shipping_address" validate:"required"`
		ShippingCity    string `json:"shipping_city" validate:"required"`
		ShippingState   string `json:"shipping_state"`
		ShippingZip     string `json:"shipping_zip" validate:"required"`
		ShippingCountry string `json:"shipping_country"`
		Items           []struct {
			ProductID uuid.UUID `json:"product_id" validate:"required"`
			Quantity  int       `json:"quantity" validate:"required,min=1"`
		} `json:"items" validate:"required,dive"`
		Notes string `json:"notes"`
	}

	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request body"})
	}

	if err := c.Validate(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}

	// Start transaction
	tx := h.db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Create order
	order := models.Order{
		ShopID:          shop.ID,
		CustomerEmail:   req.CustomerEmail,
		CustomerName:    req.CustomerName,
		CustomerPhone:   req.CustomerPhone,
		ShippingAddress: req.ShippingAddress,
		ShippingCity:    req.ShippingCity,
		ShippingState:   req.ShippingState,
		ShippingZip:     req.ShippingZip,
		ShippingCountry: req.ShippingCountry,
		Notes:           req.Notes,
		Status:          models.OrderStatusPending,
		PaymentStatus:   models.PaymentStatusPending,
	}

	if req.ShippingCountry == "" {
		order.ShippingCountry = "US"
	}

	var subtotal int
	var orderItems []models.OrderItem

	// Process each item
	for _, item := range req.Items {
		// Get product
		var product models.Product
		if err := tx.Where("id = ? AND shop_id = ? AND is_active = true", item.ProductID, shop.ID).First(&product).Error; err != nil {
			tx.Rollback()
			if err == gorm.ErrRecordNotFound {
				return c.JSON(http.StatusBadRequest, map[string]string{"error": "Product not found or inactive"})
			}
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Database error"})
		}

		// Check stock
		if product.Stock < item.Quantity {
			tx.Rollback()
			return c.JSON(http.StatusBadRequest, map[string]string{"error": "Insufficient stock for product: " + product.Name})
		}

		// Create order item
		orderItem := models.OrderItem{
			ProductID:    item.ProductID,
			ProductName:  product.Name,
			ProductSKU:   product.SKU,
			UnitPrice:    product.Price,
			Quantity:     item.Quantity,
			Total:        product.Price * item.Quantity,
		}

		// Get product image if available
		var media models.Media
		if err := tx.Where("product_id = ?", product.ID).First(&media).Error; err == nil {
			orderItem.ProductImage = media.URL
		}

		orderItems = append(orderItems, orderItem)
		subtotal += orderItem.Total

		// Update product stock
		product.Stock -= item.Quantity
		if err := tx.Save(&product).Error; err != nil {
			tx.Rollback()
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to update product stock"})
		}
	}

	// Calculate totals
	order.Subtotal = subtotal
	order.Total = subtotal // For now, no tax or shipping

	// Save order
	if err := tx.Create(&order).Error; err != nil {
		tx.Rollback()
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to create order"})
	}

	// Save order items
	for i := range orderItems {
		orderItems[i].OrderID = order.ID
		if err := tx.Create(&orderItems[i]).Error; err != nil {
			tx.Rollback()
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to create order items"})
		}
	}

	tx.Commit()

	// Load the complete order with items
	var completeOrder models.Order
	h.db.Preload("Items").Where("id = ?", order.ID).First(&completeOrder)

	return c.JSON(http.StatusCreated, completeOrder)
}