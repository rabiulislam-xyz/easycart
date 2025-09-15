package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// ProductOption represents a product option type (e.g., "Color", "Size", "Material")
type ProductOption struct {
	ID        uuid.UUID `json:"id" gorm:"type:uuid;primary_key"`
	ProductID uuid.UUID `json:"product_id" gorm:"type:uuid;not null;index"`
	Name      string    `json:"name" gorm:"not null"` // e.g., "Color", "Size"
	Position  int       `json:"position" gorm:"default:0"` // Display order
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	// Relations
	Product Product              `json:"product,omitempty" gorm:"constraint:OnDelete:CASCADE"`
	Values  []ProductOptionValue `json:"values,omitempty" gorm:"foreignKey:OptionID"`
}

// ProductOptionValue represents possible values for a product option (e.g., "Red", "Blue" for Color)
type ProductOptionValue struct {
	ID       uuid.UUID `json:"id" gorm:"type:uuid;primary_key"`
	OptionID uuid.UUID `json:"option_id" gorm:"type:uuid;not null;index"`
	Value    string    `json:"value" gorm:"not null"` // e.g., "Red", "Large", "Cotton"
	Position int       `json:"position" gorm:"default:0"` // Display order
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	// Relations
	Option ProductOption `json:"option,omitempty" gorm:"constraint:OnDelete:CASCADE"`
}

// ProductVariant represents a specific combination of option values with its own pricing/inventory
type ProductVariant struct {
	ID              uuid.UUID `json:"id" gorm:"type:uuid;primary_key"`
	ProductID       uuid.UUID `json:"product_id" gorm:"type:uuid;not null;index"`
	SKU             string    `json:"sku" gorm:"uniqueIndex;not null"`
	Price           *int      `json:"price,omitempty"` // Price in cents, if different from base product
	ComparePrice    *int      `json:"compare_price,omitempty"` // Compare price in cents
	Stock           int       `json:"stock" gorm:"default:0"`
	Weight          *float64  `json:"weight,omitempty"` // Weight in grams
	IsDefault       bool      `json:"is_default" gorm:"default:false"`
	IsActive        bool      `json:"is_active" gorm:"default:true"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`

	// Relations
	Product       Product                     `json:"product,omitempty" gorm:"constraint:OnDelete:CASCADE"`
	OptionValues  []ProductVariantOptionValue `json:"option_values,omitempty" gorm:"foreignKey:VariantID"`
	Images        []*Media                    `json:"images,omitempty" gorm:"many2many:product_variant_images"`
}

// ProductVariantOptionValue links a variant to its specific option values
type ProductVariantOptionValue struct {
	ID              uuid.UUID `json:"id" gorm:"type:uuid;primary_key"`
	VariantID       uuid.UUID `json:"variant_id" gorm:"type:uuid;not null;index"`
	OptionValueID   uuid.UUID `json:"option_value_id" gorm:"type:uuid;not null;index"`
	CreatedAt       time.Time `json:"created_at"`

	// Relations
	Variant     ProductVariant     `json:"variant,omitempty" gorm:"constraint:OnDelete:CASCADE"`
	OptionValue ProductOptionValue `json:"option_value,omitempty" gorm:"constraint:OnDelete:CASCADE"`
}

// Response DTOs
type ProductOptionResponse struct {
	ID       uuid.UUID                   `json:"id"`
	Name     string                      `json:"name"`
	Position int                         `json:"position"`
	Values   []ProductOptionValueResponse `json:"values"`
}

type ProductOptionValueResponse struct {
	ID       uuid.UUID `json:"id"`
	Value    string    `json:"value"`
	Position int       `json:"position"`
}

type ProductVariantResponse struct {
	ID              uuid.UUID                         `json:"id"`
	SKU             string                            `json:"sku"`
	Price           *int                              `json:"price,omitempty"`
	PriceDisplay    *string                           `json:"price_display,omitempty"`
	ComparePrice    *int                              `json:"compare_price,omitempty"`
	ComparePriceDisplay *string                       `json:"compare_price_display,omitempty"`
	Stock           int                               `json:"stock"`
	Weight          *float64                          `json:"weight,omitempty"`
	IsDefault       bool                              `json:"is_default"`
	IsActive        bool                              `json:"is_active"`
	OptionValues    []ProductVariantOptionValueResponse `json:"option_values"`
	Images          []*Media                          `json:"images,omitempty"`
}

type ProductVariantOptionValueResponse struct {
	OptionID    uuid.UUID `json:"option_id"`
	OptionName  string    `json:"option_name"`
	ValueID     uuid.UUID `json:"value_id"`
	Value       string    `json:"value"`
}

// BeforeCreate hooks
func (po *ProductOption) BeforeCreate(tx *gorm.DB) error {
	if po.ID == uuid.Nil {
		po.ID = uuid.New()
	}
	return nil
}

func (pov *ProductOptionValue) BeforeCreate(tx *gorm.DB) error {
	if pov.ID == uuid.Nil {
		pov.ID = uuid.New()
	}
	return nil
}

func (pv *ProductVariant) BeforeCreate(tx *gorm.DB) error {
	if pv.ID == uuid.Nil {
		pv.ID = uuid.New()
	}
	return nil
}

func (pvov *ProductVariantOptionValue) BeforeCreate(tx *gorm.DB) error {
	if pvov.ID == uuid.Nil {
		pvov.ID = uuid.New()
	}
	return nil
}

// Response methods
func (po *ProductOption) ToResponse() ProductOptionResponse {
	response := ProductOptionResponse{
		ID:       po.ID,
		Name:     po.Name,
		Position: po.Position,
		Values:   make([]ProductOptionValueResponse, len(po.Values)),
	}

	for i, value := range po.Values {
		response.Values[i] = value.ToResponse()
	}

	return response
}

func (pov *ProductOptionValue) ToResponse() ProductOptionValueResponse {
	return ProductOptionValueResponse{
		ID:       pov.ID,
		Value:    pov.Value,
		Position: pov.Position,
	}
}

func (pv *ProductVariant) ToResponse() ProductVariantResponse {
	response := ProductVariantResponse{
		ID:        pv.ID,
		SKU:       pv.SKU,
		Price:     pv.Price,
		ComparePrice: pv.ComparePrice,
		Stock:     pv.Stock,
		Weight:    pv.Weight,
		IsDefault: pv.IsDefault,
		IsActive:  pv.IsActive,
		Images:    pv.Images,
		OptionValues: make([]ProductVariantOptionValueResponse, len(pv.OptionValues)),
	}

	// Format prices if they exist
	if pv.Price != nil {
		priceDisplay := formatPrice(*pv.Price)
		response.PriceDisplay = &priceDisplay
	}
	
	if pv.ComparePrice != nil {
		comparePriceDisplay := formatPrice(*pv.ComparePrice)
		response.ComparePriceDisplay = &comparePriceDisplay
	}

	// Convert option values
	for i, optionValue := range pv.OptionValues {
		response.OptionValues[i] = ProductVariantOptionValueResponse{
			OptionID:   optionValue.OptionValue.OptionID,
			OptionName: optionValue.OptionValue.Option.Name,
			ValueID:    optionValue.OptionValue.ID,
			Value:      optionValue.OptionValue.Value,
		}
	}

	return response
}