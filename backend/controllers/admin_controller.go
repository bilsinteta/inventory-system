package controllers

import (
	"inventory-backend/config"
	"inventory-backend/models"

	"github.com/gofiber/fiber/v2"
)

type ApproveUserRequest struct {
	IsActive bool   `json:"is_active"`
	Role     string `json:"role"`
}

func GetPendingUsers(c *fiber.Ctx) error {
	var users []models.User
	// Fetch users where IsActive is false
	result := config.DB.Where("is_active = ?", false).Find(&users)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch pending users"})
	}

	return c.JSON(users)
}

func GetAllUsers(c *fiber.Ctx) error {
	var users []models.User
	// Fetch all users
	result := config.DB.Find(&users)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch users"})
	}
	return c.JSON(users)
}

func ApproveUser(c *fiber.Ctx) error {
	id := c.Params("id")
	req := new(ApproveUserRequest)

	if err := c.BodyParser(req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	var user models.User
	if err := config.DB.First(&user, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "User not found"})
	}

	// Prevent modifying Master Admin
	if user.Email == "admin" {
		return c.Status(403).JSON(fiber.Map{"error": "Cannot modify Master Admin account"})
	}

	// Update fields
	// Allow setting IsActive directly
	user.IsActive = req.IsActive

	if req.Role != "" {
		if req.Role != "admin" && req.Role != "staff" {
			return c.Status(400).JSON(fiber.Map{"error": "Invalid role"})
		}
		user.Role = req.Role
	}

	if err := config.DB.Save(&user).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to update user"})
	}

	return c.JSON(fiber.Map{
		"message": "User updated successfully",
		"user":    user,
	})
}

func DeleteUser(c *fiber.Ctx) error {
	id := c.Params("id")
	var user models.User

	if err := config.DB.First(&user, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "User not found"})
	}

	// Prevent deleting Master Admin
	if user.Email == "admin" {
		return c.Status(403).JSON(fiber.Map{"error": "Cannot delete Master Admin account"})
	}

	if err := config.DB.Delete(&user).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to delete user"})
	}

	return c.JSON(fiber.Map{"message": "User deleted successfully"})
}
