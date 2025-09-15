package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Settings struct {
	ID          uuid.UUID `json:"id" gorm:"type:uuid;primary_key"`
	ShopName    string    `json:"shop_name" gorm:"not null;default:'Demo Electronics Store'"`
	Description string    `json:"description" gorm:"default:'Your one-stop shop for electronics'"`
	Logo        string    `json:"logo"`

	// Theme settings
	PrimaryColor   string `json:"primary_color" gorm:"default:#3B82F6"`
	SecondaryColor string `json:"secondary_color" gorm:"default:#64748B"`

	// Contact information
	ContactEmail string `json:"contact_email"`
	ContactPhone string `json:"contact_phone"`

	// Address
	Address string `json:"address"`
	City    string `json:"city"`
	State   string `json:"state"`
	ZipCode string `json:"zip_code"`
	Country string `json:"country" gorm:"default:'US'"`

	// SEO
	MetaTitle       string `json:"meta_title"`
	MetaDescription string `json:"meta_description"`

	// Features flags
	EnableGuestCheckout bool `json:"enable_guest_checkout" gorm:"default:true"`
	EnableRegistration  bool `json:"enable_registration" gorm:"default:true"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func (s *Settings) BeforeCreate(tx *gorm.DB) error {
	if s.ID == uuid.Nil {
		s.ID = uuid.New()
	}
	return nil
}

// GetSettings returns the single settings record
func GetSettings(db *gorm.DB) (*Settings, error) {
	var settings Settings
	err := db.First(&settings).Error
	if err != nil {
		// If no settings exist, create default ones
		if err == gorm.ErrRecordNotFound {
			settings = Settings{
				ShopName:            "Demo Electronics Store",
				Description:         "Your one-stop shop for the latest electronics and gadgets",
				PrimaryColor:        "#3B82F6",
				SecondaryColor:      "#64748B",
				EnableGuestCheckout: true,
				EnableRegistration:  true,
				Country:             "US",
			}
			if createErr := db.Create(&settings).Error; createErr != nil {
				return nil, createErr
			}
		} else {
			return nil, err
		}
	}
	return &settings, nil
}