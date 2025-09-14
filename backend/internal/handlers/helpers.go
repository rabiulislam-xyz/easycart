package handlers

import (
	"errors"

	"easycart/internal/database"
	"easycart/internal/models"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
)

// GetShopIDFromToken extracts the user ID from JWT token context and retrieves the associated shop ID
func GetShopIDFromToken(c echo.Context) (uuid.UUID, error) {
	userID := c.Get("user_id").(uuid.UUID)
	
	db := database.GetDB()
	var shop models.Shop
	
	if err := db.Where("user_id = ?", userID).First(&shop).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return uuid.Nil, errors.New("shop not found for user")
		}
		return uuid.Nil, err
	}

	return shop.ID, nil
}