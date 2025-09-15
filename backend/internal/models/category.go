package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Category struct {
	ID          uuid.UUID `json:"id" gorm:"type:uuid;primary_key"`
	Name        string    `json:"name" gorm:"not null"`
	Slug        string    `json:"slug" gorm:"not null;index"`
	Description string    `json:"description"`
	ImageURL    string    `json:"image_url"`
	IsActive    bool      `json:"is_active" gorm:"default:true"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`

	Products []*Product `json:"products,omitempty" gorm:"foreignKey:CategoryID"`
}

func (c *Category) BeforeCreate(tx *gorm.DB) error {
	if c.ID == uuid.Nil {
		c.ID = uuid.New()
	}
	return nil
}