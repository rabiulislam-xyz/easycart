package handlers

import (
	"net/http"
	"path/filepath"
	"strings"

	"easycart/internal/database"
	"easycart/internal/models"
	"easycart/internal/services"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

type UploadHandler struct {
	minioService *services.MinIOService
}

func NewUploadHandler(minioService *services.MinIOService) *UploadHandler {
	return &UploadHandler{
		minioService: minioService,
	}
}

func (h *UploadHandler) UploadFile(c echo.Context) error {
	userID := c.Get("user_id").(uuid.UUID)

	// Get the file from the form
	file, err := c.FormFile("file")
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "no file provided")
	}

	// Validate file type
	if !services.IsValidImageType(file.Header.Get("Content-Type")) {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid file type. Only images are allowed")
	}

	// Check file size (5MB limit)
	if file.Size > 5*1024*1024 {
		return echo.NewHTTPError(http.StatusBadRequest, "file too large. Maximum size is 5MB")
	}

	// Open the file
	src, err := file.Open()
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to open file")
	}
	defer src.Close()

	// Get user's shop ID
	db := database.GetDB()
	var shop models.Shop
	if err := db.Where("user_id = ?", userID).First(&shop).Error; err != nil {
		return echo.NewHTTPError(http.StatusNotFound, "shop not found")
	}

	// Upload to MinIO
	folder := "uploads/" + shop.ID.String()
	result, err := h.minioService.UploadFile(src, file, folder)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to upload file")
	}

	// Save to database
	media := models.Media{
		ShopID:   shop.ID,
		Filename: result.Filename,
		URL:      result.URL,
		MimeType: result.MimeType,
		Size:     result.Size,
		Alt:      strings.TrimSuffix(file.Filename, filepath.Ext(file.Filename)),
	}

	if err := db.Create(&media).Error; err != nil {
		// Try to delete the uploaded file if database save fails
		h.minioService.DeleteFile(folder + "/" + result.Filename)
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to save file record")
	}

	return c.JSON(http.StatusCreated, media)
}