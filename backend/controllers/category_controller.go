package controllers

import (
	"inventory-backend/config"
	"inventory-backend/models"

	"github.com/gofiber/fiber/v2"
)

type CategoryRequest struct {
	Name        string `json:"name"`
	Description string `json:"description"`
}

// Get All Categories
func GetCategories(c *fiber.Ctx) error {
	var categories []models.Category
	if err := config.DB.Find(&categories).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch categories"})
	}
	return c.JSON(categories)
}

// Create Category
func CreateCategory(c *fiber.Ctx) error {
	req := new(CategoryRequest)
	if err := c.BodyParser(req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	if req.Name == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Category name is required"})
	}

	category := models.Category{
		Name:        req.Name,
		Description: req.Description,
	}

	if err := config.DB.Create(&category).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create category"})
	}

	return c.Status(201).JSON(category)
}

// Update Category
func UpdateCategory(c *fiber.Ctx) error {
	id := c.Params("id")
	req := new(CategoryRequest)

	if err := c.BodyParser(req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	var category models.Category
	if err := config.DB.First(&category, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Category not found"})
	}

	category.Name = req.Name
	category.Description = req.Description

	if err := config.DB.Save(&category).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to update category"})
	}

	return c.JSON(category)
}

// Delete Category
func DeleteCategory(c *fiber.Ctx) error {
	id := c.Params("id")
	var category models.Category

	if err := config.DB.First(&category, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Category not found"})
	}

	if err := config.DB.Delete(&category).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to delete category"})
	}

	return c.JSON(fiber.Map{"message": "Category deleted successfully"})
}
