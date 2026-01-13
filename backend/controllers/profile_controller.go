package controllers

import (
	"inventory-backend/config"
	"inventory-backend/models"
	"inventory-backend/utils"

	"github.com/gofiber/fiber/v2"
)

type UpdateProfileRequest struct {
	Name string `json:"name"`
	// Email string `json:"email"` // For now, let's keep email immutable or require separate flow
}

type ChangePasswordRequest struct {
	CurrentPassword string `json:"current_password"`
	NewPassword     string `json:"new_password"`
}

// UpdateProfile updates the user's basic information
func UpdateProfile(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uint)

	req := new(UpdateProfileRequest)
	if err := c.BodyParser(req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	if req.Name == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Name cannot be empty"})
	}

	var userModel models.User
	if err := config.DB.First(&userModel, userID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "User not found"})
	}

	userModel.Name = req.Name
	if err := config.DB.Save(&userModel).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to update profile"})
	}

	return c.JSON(fiber.Map{
		"message": "Profile updated successfully",
		"user": fiber.Map{
			"id":    userModel.ID,
			"name":  userModel.Name,
			"email": userModel.Email,
			"role":  userModel.Role,
		},
	})
}

// ChangePassword allows the user to change their password securely
func ChangePassword(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uint)

	req := new(ChangePasswordRequest)
	if err := c.BodyParser(req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	if req.CurrentPassword == "" || req.NewPassword == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Current and new passwords are required"})
	}

	if len(req.NewPassword) < 6 {
		return c.Status(400).JSON(fiber.Map{"error": "New password must be at least 6 characters"})
	}

	var userModel models.User
	if err := config.DB.First(&userModel, userID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "User not found"})
	}

	// Verify old password
	if !utils.CheckPassword(userModel.Password, req.CurrentPassword) {
		return c.Status(401).JSON(fiber.Map{"error": "Incorrect current password"})
	}

	// Hash new password
	hashedPassword, err := utils.HashPassword(req.NewPassword)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to hash new password"})
	}

	userModel.Password = hashedPassword
	if err := config.DB.Save(&userModel).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to update password"})
	}

	return c.JSON(fiber.Map{"message": "Password changed successfully"})
}
