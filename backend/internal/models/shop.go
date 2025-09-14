package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Shop struct {
	ID          uuid.UUID `json:"id" gorm:"type:uuid;primary_key"`
	UserID      uuid.UUID `json:"user_id" gorm:"type:uuid;not null;uniqueIndex"`
	Name        string    `json:"name" gorm:"not null"`
	Slug        string    `json:"slug" gorm:"uniqueIndex;not null"`
	Description string    `json:"description"`
	Logo        string    `json:"logo"`
	
	// Theme settings
	PrimaryColor   string `json:"primary_color" gorm:"default:#3B82F6"`
	SecondaryColor string `json:"secondary_color" gorm:"default:#64748B"`
	
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	
	User *User `json:"user,omitempty" gorm:"constraint:OnDelete:CASCADE"`
}

func (s *Shop) BeforeCreate(tx *gorm.DB) error {
	if s.ID == uuid.Nil {
		s.ID = uuid.New()
	}
	return nil
}