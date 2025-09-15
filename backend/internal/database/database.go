package database

import (
	"fmt"
	"log"

	"easycart/internal/config"
	"easycart/internal/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func Connect(cfg *config.Config) error {
	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=disable",
		cfg.DBHost, cfg.DBUser, cfg.DBPassword, cfg.DBName, cfg.DBPort,
	)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return fmt.Errorf("failed to connect to database: %w", err)
	}

	DB = db

	// Auto-migrate models
	err = db.AutoMigrate(
		&models.User{},
		&models.Settings{},
		&models.Category{},
		&models.Product{},
		&models.Media{},
		&models.Order{},
		&models.OrderItem{},
	)
	if err != nil {
		return fmt.Errorf("failed to migrate database: %w", err)
	}

	log.Println("Database connected and migrated successfully")
	return nil
}

func GetDB() *gorm.DB {
	return DB
}