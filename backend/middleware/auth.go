package middleware

import (
	"inventory-backend/config"
	"inventory-backend/models"
	"inventory-backend/utils"
	"strings"

	"github.com/gofiber/fiber/v2"
)

func AuthRequired(c *fiber.Ctx) error {
	authHeader := c.Get("Authorization")
	if authHeader == "" {
		return c.Status(401).JSON(fiber.Map{
			"error": "Unauthorized: No token provided",
		})
	}

	tokenString := strings.Replace(authHeader, "Bearer ", "", 1)

	claims, err := utils.VerifyToken(tokenString)
	if err != nil {
		return c.Status(401).JSON(fiber.Map{
			"error": "Unauthorized: Invalid token",
		})
	}

	// Double check to database for role & isActive updates
	var user models.User
	if err := config.DB.First(&user, claims.UserID).Error; err != nil {
		return c.Status(401).JSON(fiber.Map{
			"error": "Unauthorized: User not found",
		})
	}

	if !user.IsActive {
		return c.Status(403).JSON(fiber.Map{
			"error": "Forbidden: Your account is inactive",
		})
	}

	c.Locals("userID", user.ID)
	c.Locals("email", user.Email)
	c.Locals("role", user.Role) // Use role from DB, not from Token!

	return c.Next()
}

// Admin only middleware
func AdminOnly(c *fiber.Ctx) error {
	role := c.Locals("role").(string)

	if role != "admin" {
		return c.Status(403).JSON(fiber.Map{
			"error": "Forbidden: Admin access required",
		})
	}

	return c.Next()
}
