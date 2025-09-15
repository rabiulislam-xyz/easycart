package main

import (
	"log"

	"easycart/internal/config"
	"easycart/internal/database"
	"easycart/internal/handlers"
	"easycart/internal/middleware"
	"easycart/internal/services"
	"easycart/internal/validator"
	"github.com/labstack/echo/v4"
	echomiddleware "github.com/labstack/echo/v4/middleware"
)

func main() {
	cfg := config.Load()
	
	// Connect to database
	log.Println("Attempting to connect to database...")
	if err := database.Connect(cfg); err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	log.Println("Database connected successfully")
	
	// Initialize MinIO service
	log.Println("Connecting to MinIO...")
	minioService, err := services.NewMinIOService(cfg)
	if err != nil {
		log.Fatalf("Failed to connect to MinIO: %v", err)
	}
	log.Println("MinIO connected successfully")
	
	e := echo.New()
	
	// Set validator
	e.Validator = validator.New()
	
	// Middleware
	e.Use(echomiddleware.Logger())
	e.Use(echomiddleware.Recover())
	e.Use(middleware.CORS())
	
	// Initialize handlers
	authHandler := handlers.NewAuthHandler(database.DB, cfg.JWTSecret)
	settingsHandler := handlers.NewSettingsHandler(database.DB)
	productHandler := handlers.NewProductHandler(database.DB)
	categoryHandler := handlers.NewCategoryHandler(database.DB)
	uploadHandler := handlers.NewUploadHandler(minioService)
	orderHandler := handlers.NewOrderHandler(database.DB)
	adminHandler := handlers.NewAdminHandler(database.DB)
	storefrontHandler := handlers.NewStorefrontHandler(database.DB)
	
	// Routes
	api := e.Group("/api/v1")
	api.GET("/health", handlers.HealthCheck)
	
	// Auth routes
	auth := api.Group("/auth")
	auth.POST("/login", authHandler.Login)
	auth.POST("/register", authHandler.Register) // Customer registration

	// Protected routes
	protected := api.Group("")
	protected.Use(middleware.JWTMiddleware(cfg.JWTSecret))

	// User routes
	protected.GET("/profile", authHandler.GetProfile)

	// Admin routes (require admin/manager role)
	admin := api.Group("/admin")
	admin.Use(middleware.JWTMiddleware(cfg.JWTSecret))
	admin.Use(middleware.AdminMiddleware()) // New middleware for role checking

	// Settings routes
	admin.GET("/settings", settingsHandler.GetSettings)
	admin.PUT("/settings", settingsHandler.UpdateSettings)

	// User management (admin only)
	admin.GET("/users", adminHandler.GetUsers)
	admin.POST("/users", adminHandler.CreateUser)
	admin.PUT("/users/:id", adminHandler.UpdateUser)
	admin.DELETE("/users/:id", adminHandler.DeleteUser)
	
	// Admin management routes (admin/manager access)
	admin.POST("/uploads", uploadHandler.UploadFile)

	// Category management
	admin.GET("/categories", categoryHandler.GetCategories)
	admin.GET("/categories/:id", categoryHandler.GetCategory)
	admin.POST("/categories", categoryHandler.CreateCategory)
	admin.PUT("/categories/:id", categoryHandler.UpdateCategory)
	admin.DELETE("/categories/:id", categoryHandler.DeleteCategory)

	// Product management
	admin.GET("/products", productHandler.GetProducts)
	admin.GET("/products/:id", productHandler.GetProduct)
	admin.POST("/products", productHandler.CreateProduct)
	admin.PUT("/products/:id", productHandler.UpdateProduct)
	admin.DELETE("/products/:id", productHandler.DeleteProduct)

	// Order management
	admin.GET("/orders", orderHandler.GetOrders)
	admin.GET("/orders/:id", orderHandler.GetOrder)
	admin.PUT("/orders/:id/status", orderHandler.UpdateOrderStatus)
	
	// Public storefront routes (single shop)
	api.GET("/store", storefrontHandler.GetShop)
	api.GET("/store/products", storefrontHandler.GetShopProducts)
	api.GET("/store/products/:productId", storefrontHandler.GetShopProduct)
	api.GET("/store/categories", storefrontHandler.GetShopCategories)
	api.POST("/store/orders", storefrontHandler.CreatePublicOrder)
	
	log.Printf("Starting server on port %s", cfg.Port)
	if err := e.Start(":" + cfg.Port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}