package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Media struct {
	ID        uuid.UUID  `json:"id" gorm:"type:uuid;primary_key"`
	ShopID    uuid.UUID  `json:"shop_id" gorm:"type:uuid;not null;index"`
	ProductID *uuid.UUID `json:"product_id,omitempty" gorm:"type:uuid;index"`
	Filename  string     `json:"filename" gorm:"not null"`
	URL       string     `json:"url" gorm:"not null"`
	MimeType  string     `json:"mime_type" gorm:"not null"`
	Size      int64      `json:"size" gorm:"not null"`
	Width     *int       `json:"width,omitempty"`
	Height    *int       `json:"height,omitempty"`
	Alt       string     `json:"alt"`
	SortOrder int        `json:"sort_order" gorm:"default:0"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`

	Shop    *Shop    `json:"shop,omitempty" gorm:"constraint:OnDelete:CASCADE"`
	Product *Product `json:"product,omitempty" gorm:"constraint:OnDelete:CASCADE"`
}

func (m *Media) BeforeCreate(tx *gorm.DB) error {
	if m.ID == uuid.Nil {
		m.ID = uuid.New()
	}
	return nil
}