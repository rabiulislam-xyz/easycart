package models

import (
	"fmt"
	"time"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type OrderStatus string

const (
	OrderStatusPending    OrderStatus = "pending"
	OrderStatusProcessing OrderStatus = "processing"
	OrderStatusShipped    OrderStatus = "shipped"
	OrderStatusDelivered  OrderStatus = "delivered"
	OrderStatusCancelled  OrderStatus = "cancelled"
)

type PaymentStatus string

const (
	PaymentStatusPending   PaymentStatus = "pending"
	PaymentStatusPaid      PaymentStatus = "paid"
	PaymentStatusFailed    PaymentStatus = "failed"
	PaymentStatusRefunded  PaymentStatus = "refunded"
)

type Order struct {
	ID              uuid.UUID     `json:"id" gorm:"type:uuid;primary_key"`
	OrderNumber     string        `json:"order_number" gorm:"unique;not null"`

	// Customer Information (enhanced for guest checkout)
	CustomerID      *uuid.UUID    `json:"customer_id,omitempty" gorm:"type:uuid;index"` // null for guest orders
	CustomerEmail   string        `json:"customer_email" gorm:"not null"`
	CustomerName    string        `json:"customer_name" gorm:"not null"`
	CustomerPhone   string        `json:"customer_phone" gorm:"not null"`
	IsGuestOrder    bool          `json:"is_guest_order" gorm:"default:false"`

	// Shipping Address (enhanced)
	ShippingFirstName string `json:"shipping_first_name"`
	ShippingLastName  string `json:"shipping_last_name"`
	ShippingAddress   string `json:"shipping_address" gorm:"not null"`
	ShippingAddress2  string `json:"shipping_address2"`
	ShippingCity      string `json:"shipping_city" gorm:"not null"`
	ShippingState     string `json:"shipping_state"`
	ShippingZip       string `json:"shipping_zip" gorm:"not null"`
	ShippingCountry   string `json:"shipping_country" gorm:"not null;default:'US'"`

	// Billing Address (can be same as shipping)
	BillingFirstName string `json:"billing_first_name"`
	BillingLastName  string `json:"billing_last_name"`
	BillingAddress   string `json:"billing_address"`
	BillingAddress2  string `json:"billing_address2"`
	BillingCity      string `json:"billing_city"`
	BillingState     string `json:"billing_state"`
	BillingZip       string `json:"billing_zip"`
	BillingCountry   string `json:"billing_country"`
	SameAsBilling    bool   `json:"same_as_billing" gorm:"default:true"`

	// Order totals (in cents)
	Subtotal      int `json:"subtotal" gorm:"not null"`
	TaxAmount     int `json:"tax_amount" gorm:"default:0"`
	ShippingCost  int `json:"shipping_cost" gorm:"default:0"`
	Total         int `json:"total" gorm:"not null"`

	// Status
	Status        OrderStatus   `json:"status" gorm:"type:varchar(20);default:'pending'"`
	PaymentStatus PaymentStatus `json:"payment_status" gorm:"type:varchar(20);default:'pending'"`

	// Metadata
	Notes     string    `json:"notes"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	// Relations
	Customer  *User       `json:"customer,omitempty" gorm:"foreignKey:CustomerID"`
	Items     []OrderItem `json:"items,omitempty" gorm:"foreignKey:OrderID"`
}

type OrderItem struct {
	ID        uuid.UUID `json:"id" gorm:"type:uuid;primary_key"`
	OrderID   uuid.UUID `json:"order_id" gorm:"type:uuid;not null;index"`
	ProductID uuid.UUID `json:"product_id" gorm:"type:uuid;not null;index"`
	
	// Snapshot of product data at time of order
	ProductName  string `json:"product_name" gorm:"not null"`
	ProductSKU   string `json:"product_sku"`
	ProductImage string `json:"product_image"`
	
	// Pricing (in cents)
	UnitPrice int `json:"unit_price" gorm:"not null"`
	Quantity  int `json:"quantity" gorm:"not null"`
	Total     int `json:"total" gorm:"not null"`
	
	CreatedAt time.Time `json:"created_at"`
	
	// Relations
	Order   Order   `json:"order,omitempty" gorm:"foreignKey:OrderID"`
	Product Product `json:"product,omitempty" gorm:"foreignKey:ProductID"`
}

// BeforeCreate hook for Order
func (o *Order) BeforeCreate(tx *gorm.DB) error {
	if o.ID == uuid.Nil {
		o.ID = uuid.New()
	}
	
	// Generate order number if not set
	if o.OrderNumber == "" {
		o.OrderNumber = generateOrderNumber()
	}
	
	return nil
}

// BeforeCreate hook for OrderItem
func (oi *OrderItem) BeforeCreate(tx *gorm.DB) error {
	if oi.ID == uuid.Nil {
		oi.ID = uuid.New()
	}
	return nil
}

// Helper function to generate order number
func generateOrderNumber() string {
	// Simple order number generation - could be made more sophisticated
	timestamp := time.Now().Unix()
	return fmt.Sprintf("ORD-%d", timestamp)
}