package handlers

import (
	"net/http"
	"strconv"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
	"gorm.io/gorm"

	"easycart/internal/models"
)

type OrderHandler struct {
	db *gorm.DB
}

func NewOrderHandler(db *gorm.DB) *OrderHandler {
	return &OrderHandler{db: db}
}

// CreateOrder creates a new order
func (h *OrderHandler) CreateOrder(c echo.Context) error {
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

	// Get shop ID from token
	shopID, err := GetShopIDFromToken(c)
	if err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "Invalid token"})
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
		if err := tx.Where("id = ? AND shop_id = ? AND is_active = true", item.ProductID, shopID).First(&product).Error; err != nil {
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

// GetOrders gets all orders for a shop
func (h *OrderHandler) GetOrders(c echo.Context) error {
	shopID, err := GetShopIDFromToken(c)
	if err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "Invalid token"})
	}

	page, _ := strconv.Atoi(c.QueryParam("page"))
	if page < 1 {
		page = 1
	}
	limit, _ := strconv.Atoi(c.QueryParam("limit"))
	if limit < 1 || limit > 100 {
		limit = 20
	}

	status := c.QueryParam("status")
	search := c.QueryParam("search")

	query := h.db.Where("shop_id = ?", shopID)

	if status != "" {
		query = query.Where("status = ?", status)
	}

	if search != "" {
		query = query.Where("order_number ILIKE ? OR customer_name ILIKE ? OR customer_email ILIKE ?", 
			"%"+search+"%", "%"+search+"%", "%"+search+"%")
	}

	var total int64
	query.Model(&models.Order{}).Count(&total)

	var orders []models.Order
	offset := (page - 1) * limit
	
	if err := query.Preload("Items").Order("created_at DESC").Offset(offset).Limit(limit).Find(&orders).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Database error"})
	}

	totalPages := int((total + int64(limit) - 1) / int64(limit))

	response := map[string]interface{}{
		"orders": orders,
		"pagination": map[string]interface{}{
			"page":        page,
			"limit":       limit,
			"total":       total,
			"total_pages": totalPages,
		},
	}

	return c.JSON(http.StatusOK, response)
}

// GetOrder gets a single order by ID
func (h *OrderHandler) GetOrder(c echo.Context) error {
	shopID, err := GetShopIDFromToken(c)
	if err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "Invalid token"})
	}

	id := c.Param("id")
	orderID, err := uuid.Parse(id)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid order ID"})
	}

	var order models.Order
	if err := h.db.Preload("Items.Product").Where("id = ? AND shop_id = ?", orderID, shopID).First(&order).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.JSON(http.StatusNotFound, map[string]string{"error": "Order not found"})
		}
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Database error"})
	}

	return c.JSON(http.StatusOK, order)
}

// UpdateOrderStatus updates an order's status
func (h *OrderHandler) UpdateOrderStatus(c echo.Context) error {
	shopID, err := GetShopIDFromToken(c)
	if err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "Invalid token"})
	}

	id := c.Param("id")
	orderID, err := uuid.Parse(id)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid order ID"})
	}

	var req struct {
		Status        string `json:"status"`
		PaymentStatus string `json:"payment_status"`
	}

	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request body"})
	}

	var order models.Order
	if err := h.db.Where("id = ? AND shop_id = ?", orderID, shopID).First(&order).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.JSON(http.StatusNotFound, map[string]string{"error": "Order not found"})
		}
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Database error"})
	}

	// Update status if provided
	if req.Status != "" {
		order.Status = models.OrderStatus(req.Status)
	}
	if req.PaymentStatus != "" {
		order.PaymentStatus = models.PaymentStatus(req.PaymentStatus)
	}

	if err := h.db.Save(&order).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to update order"})
	}

	return c.JSON(http.StatusOK, order)
}