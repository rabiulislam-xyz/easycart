package handlers

import (
	"net/http"
	"time"

	"github.com/labstack/echo/v4"
)

type HealthResponse struct {
	Status    string    `json:"status"`
	Timestamp time.Time `json:"timestamp"`
	Service   string    `json:"service"`
}

func HealthCheck(c echo.Context) error {
	response := HealthResponse{
		Status:    "healthy",
		Timestamp: time.Now(),
		Service:   "easycart-backend",
	}
	
	return c.JSON(http.StatusOK, response)
}