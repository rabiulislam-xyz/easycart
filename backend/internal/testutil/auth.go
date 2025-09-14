package testutil

import (
	"time"

	"easycart/internal/middleware"
	"easycart/internal/models"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

func CreateTestUser(db *gorm.DB, email string) *models.User {
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)
	
	user := models.User{
		ID:           uuid.New(),
		Email:        email,
		FirstName:    "Test",
		LastName:     "User", 
		PasswordHash: string(hashedPassword),
	}
	
	db.Create(&user)
	return &user
}

func CreateTestShop(db *gorm.DB, user *models.User, name string) *models.Shop {
	shop := models.Shop{
		ID:     uuid.New(),
		UserID: user.ID,
		Name:   name,
		Slug:   "test-shop",
	}
	
	db.Create(&shop)
	return &shop
}

func CreateTestCategory(db *gorm.DB, shop *models.Shop, name string) *models.Category {
	category := models.Category{
		ID:     uuid.New(),
		ShopID: shop.ID,
		Name:   name,
	}
	
	db.Create(&category)
	return &category
}

func CreateTestProduct(db *gorm.DB, shop *models.Shop, name string, price int) *models.Product {
	product := models.Product{
		ID:       uuid.New(),
		ShopID:   shop.ID,
		Name:     name,
		Price:    price,
		Stock:    10,
		SKU:      "TEST-" + uuid.New().String()[:8],
		IsActive: true,
	}
	
	db.Create(&product)
	return &product
}

func GenerateTestJWT(userID uuid.UUID, email string) string {
	claims := &middleware.JWTClaims{
		UserID: userID,
		Email:  email,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, _ := token.SignedString([]byte("test-jwt-secret-key"))
	return tokenString
}