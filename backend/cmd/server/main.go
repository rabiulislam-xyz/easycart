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
	shopHandler := handlers.NewShopHandler(database.DB)
	productHandler := handlers.NewProductHandler(database.DB)
	categoryHandler := handlers.NewCategoryHandler(database.DB)
	uploadHandler := handlers.NewUploadHandler(minioService)
	orderHandler := handlers.NewOrderHandler(database.DB)
	storefrontHandler := handlers.NewStorefrontHandler(database.DB)
	
	// Routes
	api := e.Group("/api/v1")
	api.GET("/health", handlers.HealthCheck)
	
	// Auth routes
	auth := api.Group("/auth")
	auth.POST("/register", authHandler.Register)
	auth.POST("/login", authHandler.Login)
	
	// Protected routes
	protected := api.Group("")
	protected.Use(middleware.JWTMiddleware(cfg.JWTSecret))
	
	// User routes
	protected.GET("/profile", authHandler.GetProfile)
	
	// Shop routes
	protected.GET("/shop", shopHandler.GetShop)
	protected.POST("/shop", shopHandler.CreateShop)
	protected.PUT("/shop", shopHandler.UpdateShop)
	
	// Upload routes
	protected.POST("/uploads", uploadHandler.UploadFile)
	
	// Category routes
	protected.GET("/categories", categoryHandler.GetCategories)
	protected.GET("/categories/:id", categoryHandler.GetCategory)
	protected.POST("/categories", categoryHandler.CreateCategory)
	protected.PUT("/categories/:id", categoryHandler.UpdateCategory)
	protected.DELETE("/categories/:id", categoryHandler.DeleteCategory)
	
	// Product routes
	protected.GET("/products", productHandler.GetProducts)
	protected.GET("/products/:id", productHandler.GetProduct)
	protected.POST("/products", productHandler.CreateProduct)
	protected.PUT("/products/:id", productHandler.UpdateProduct)
	protected.DELETE("/products/:id", productHandler.DeleteProduct)
	
	// Order routes (protected - for shop owners)
	protected.GET("/orders", orderHandler.GetOrders)
	protected.GET("/orders/:id", orderHandler.GetOrder)
	protected.PUT("/orders/:id/status", orderHandler.UpdateOrderStatus)
	
	// Public storefront routes
	storefront := api.Group("/store/:slug")
	storefront.GET("", storefrontHandler.GetShop)
	storefront.GET("/products", storefrontHandler.GetShopProducts)
	storefront.GET("/products/:productId", storefrontHandler.GetShopProduct)
	storefront.GET("/categories", storefrontHandler.GetShopCategories)
	storefront.POST("/orders", storefrontHandler.CreatePublicOrder)
	
	log.Printf("Starting server on port %s", cfg.Port)
	if err := e.Start(":" + cfg.Port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}