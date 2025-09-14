package testutil

import (
	"fmt"
	"log"

	"easycart/internal/config"
	"easycart/internal/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func SetupTestDB() (*gorm.DB, func()) {
	cfg := config.LoadTestConfig()
	
	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=disable",
		cfg.DBHost, cfg.DBUser, cfg.DBPassword, cfg.DBName, cfg.DBPort,
	)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Silent), // Suppress logs during tests
	})
	if err != nil {
		log.Fatalf("Failed to connect to test database: %v", err)
	}

	// Auto-migrate models for testing
	err = db.AutoMigrate(
		&models.User{},
		&models.Shop{},
		&models.Category{},
		&models.Product{},
		&models.Media{},
		&models.Order{},
		&models.OrderItem{},
	)
	if err != nil {
		log.Fatalf("Failed to migrate test database: %v", err)
	}

	// Return cleanup function
	cleanup := func() {
		// Drop all tables in reverse order to handle foreign keys
		db.Exec("DROP TABLE IF EXISTS order_items CASCADE")
		db.Exec("DROP TABLE IF EXISTS orders CASCADE")
		db.Exec("DROP TABLE IF EXISTS media CASCADE")
		db.Exec("DROP TABLE IF EXISTS products CASCADE")
		db.Exec("DROP TABLE IF EXISTS categories CASCADE")
		db.Exec("DROP TABLE IF EXISTS shops CASCADE")
		db.Exec("DROP TABLE IF EXISTS users CASCADE")

		sqlDB, _ := db.DB()
		sqlDB.Close()
	}

	return db, cleanup
}

func CleanupDB(db *gorm.DB) {
	// Clean all tables for fresh test state
	db.Exec("DELETE FROM order_items")
	db.Exec("DELETE FROM orders")
	db.Exec("DELETE FROM media")
	db.Exec("DELETE FROM products")
	db.Exec("DELETE FROM categories")
	db.Exec("DELETE FROM shops")
	db.Exec("DELETE FROM users")
}