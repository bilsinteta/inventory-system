package middleware

import (
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

	c.Locals("userID", claims.UserID)
	c.Locals("email", claims.Email)
	c.Locals("role", claims.Role)

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