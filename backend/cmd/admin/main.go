package main

import (
	"fmt"
	"log"
	"os"

	"easycart/internal/config"
	"easycart/internal/database"
	"easycart/internal/models"
)

func main() {
	if len(os.Args) < 2 {
		fmt.Println("Usage: admin <command>")
		fmt.Println("Commands:")
		fmt.Println("  create-admin - Create the first admin user")
		fmt.Println("  reset-db     - Reset database (WARNING: Destructive)")
		os.Exit(1)
	}

	cfg := config.Load()

	// Connect to database
	if err := database.Connect(cfg); err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	command := os.Args[1]
	switch command {
	case "create-admin":
		createAdmin()
	case "reset-db":
		resetDatabase()
	default:
		fmt.Printf("Unknown command: %s\n", command)
		os.Exit(1)
	}
}

func createAdmin() {
	// Check if any admin exists
	var count int64
	database.DB.Model(&models.User{}).Where("role = ?", models.UserRoleAdmin).Count(&count)
	if count > 0 {
		fmt.Println("Admin user already exists!")
		os.Exit(1)
	}

	fmt.Print("Admin Email: ")
	var email string
	fmt.Scanln(&email)

	fmt.Print("First Name: ")
	var firstName string
	fmt.Scanln(&firstName)

	fmt.Print("Last Name: ")
	var lastName string
	fmt.Scanln(&lastName)

	fmt.Print("Password: ")
	var password string
	fmt.Scanln(&password)

	fmt.Print("Confirm Password: ")
	var confirmPassword string
	fmt.Scanln(&confirmPassword)

	if password != confirmPassword {
		fmt.Println("Passwords do not match!")
		os.Exit(1)
	}

	if len(password) < 6 {
		fmt.Println("Password must be at least 6 characters long!")
		os.Exit(1)
	}

	// Create admin user
	admin := models.User{
		Email:     email,
		FirstName: firstName,
		LastName:  lastName,
		Role:      models.UserRoleAdmin,
		IsActive:  true,
	}

	if err := admin.HashPassword(password); err != nil {
		log.Fatalf("Failed to hash password: %v", err)
	}

	if err := database.DB.Create(&admin).Error; err != nil {
		log.Fatalf("Failed to create admin user: %v", err)
	}

	fmt.Printf("✅ Admin user created successfully!\n")
	fmt.Printf("Email: %s\n", admin.Email)
	fmt.Printf("Name: %s %s\n", admin.FirstName, admin.LastName)
	fmt.Printf("Role: %s\n", admin.Role)
}

func resetDatabase() {
	fmt.Print("⚠️  This will delete ALL data! Type 'CONFIRM' to proceed: ")
	var confirmation string
	fmt.Scanln(&confirmation)

	if confirmation != "CONFIRM" {
		fmt.Println("Operation cancelled.")
		os.Exit(0)
	}

	// Drop all tables
	err := database.DB.Migrator().DropTable(
		&models.OrderItem{},
		&models.Order{},
		&models.Media{},
		&models.Product{},
		&models.Category{},
		&models.Settings{},
		&models.User{},
	)
	if err != nil {
		log.Fatalf("Failed to drop tables: %v", err)
	}

	// Re-create tables
	err = database.DB.AutoMigrate(
		&models.User{},
		&models.Settings{},
		&models.Category{},
		&models.Product{},
		&models.Media{},
		&models.Order{},
		&models.OrderItem{},
	)
	if err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}

	fmt.Println("✅ Database reset successfully!")
}