package models

import (
	"fmt"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Product struct {
	ID          uuid.UUID `json:"id" gorm:"type:uuid;primary_key"`
	ShopID      uuid.UUID `json:"shop_id" gorm:"type:uuid;not null;index"`
	CategoryID  *uuid.UUID `json:"category_id,omitempty" gorm:"type:uuid;index"`
	Name        string    `json:"name" gorm:"not null"`
	Slug        string    `json:"slug" gorm:"not null;index"`
	Description string    `json:"description"`
	SKU         string    `json:"sku" gorm:"uniqueIndex;not null"`
	Price       int       `json:"price" gorm:"not null"` // Price in cents
	ComparePrice *int     `json:"compare_price,omitempty"` // Original price in cents
	Stock       int       `json:"stock" gorm:"default:0"`
	MinStock    int       `json:"min_stock" gorm:"default:0"`
	Weight      *float64  `json:"weight,omitempty"` // Weight in grams
	IsActive    bool      `json:"is_active" gorm:"default:true"`
	IsFeatured  bool      `json:"is_featured" gorm:"default:false"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`

	Shop     *Shop     `json:"shop,omitempty" gorm:"constraint:OnDelete:CASCADE"`
	Category *Category `json:"category,omitempty" gorm:"constraint:OnDelete:SET NULL"`
	Images   []*Media  `json:"images,omitempty" gorm:"foreignKey:ProductID"`
}

type ProductResponse struct {
	ID           uuid.UUID  `json:"id"`
	ShopID       uuid.UUID  `json:"shop_id"`
	CategoryID   *uuid.UUID `json:"category_id,omitempty"`
	Name         string     `json:"name"`
	Slug         string     `json:"slug"`
	Description  string     `json:"description"`
	SKU          string     `json:"sku"`
	Price        int        `json:"price"`
	PriceDisplay string     `json:"price_display"`
	ComparePrice *int       `json:"compare_price,omitempty"`
	ComparePriceDisplay *string `json:"compare_price_display,omitempty"`
	Stock        int        `json:"stock"`
	MinStock     int        `json:"min_stock"`
	Weight       *float64   `json:"weight,omitempty"`
	IsActive     bool       `json:"is_active"`
	IsFeatured   bool       `json:"is_featured"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
	Category     *Category  `json:"category,omitempty"`
	Images       []*Media   `json:"images,omitempty"`
}

func (p *Product) BeforeCreate(tx *gorm.DB) error {
	if p.ID == uuid.Nil {
		p.ID = uuid.New()
	}
	return nil
}

func (p *Product) ToResponse() ProductResponse {
	response := ProductResponse{
		ID:          p.ID,
		ShopID:      p.ShopID,
		CategoryID:  p.CategoryID,
		Name:        p.Name,
		Slug:        p.Slug,
		Description: p.Description,
		SKU:         p.SKU,
		Price:       p.Price,
		PriceDisplay: formatPrice(p.Price),
		Stock:       p.Stock,
		MinStock:    p.MinStock,
		Weight:      p.Weight,
		IsActive:    p.IsActive,
		IsFeatured:  p.IsFeatured,
		CreatedAt:   p.CreatedAt,
		UpdatedAt:   p.UpdatedAt,
		Category:    p.Category,
		Images:      p.Images,
	}

	if p.ComparePrice != nil {
		response.ComparePrice = p.ComparePrice
		comparePriceDisplay := formatPrice(*p.ComparePrice)
		response.ComparePriceDisplay = &comparePriceDisplay
	}

	return response
}

func formatPrice(priceInCents int) string {
	dollars := float64(priceInCents) / 100
	return "$" + fmt.Sprintf("%.2f", dollars)
}