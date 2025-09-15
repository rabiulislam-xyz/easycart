package middleware

import (
	"net/http"

	"easycart/internal/database"
	"easycart/internal/models"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

// AdminMiddleware ensures only admin/manager users can access admin routes
func AdminMiddleware() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			userID, ok := c.Get("user_id").(uuid.UUID)
			if !ok {
				return echo.NewHTTPError(http.StatusUnauthorized, "Invalid user context")
			}

			// Fetch user from database
			var user models.User
			if err := database.DB.First(&user, userID).Error; err != nil {
				return echo.NewHTTPError(http.StatusUnauthorized, "User not found")
			}

			// Only admin and manager roles can access admin routes
			if !user.IsManager() {
				return echo.NewHTTPError(http.StatusForbidden, "Access denied: admin or manager role required")
			}

			// Set user in context for handlers that need it
			c.Set("user", &user)
			return next(c)
		}
	}
}