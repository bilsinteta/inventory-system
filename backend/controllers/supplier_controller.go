package controllers

import (
	"inventory-backend/config"
	"inventory-backend/models"

	"github.com/gofiber/fiber/v2"
)

type SupplierRequest struct {
	Name        string `json:"name"`
	ContactName string `json:"contact_name"`
	Phone       string `json:"phone"`
	Email       string `json:"email"`
	Address     string `json:"address"`
}

func GetSuppliers(c *fiber.Ctx) error {
	var suppliers []models.Supplier
	
	if err := config.DB.Find(&suppliers).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch suppliers"})
	}

	return c.JSON(fiber.Map{
		"suppliers": suppliers,
	})
}

func GetSupplier(c *fiber.Ctx) error {
	id := c.Params("id")

	var supplier models.Supplier
	if err := config.DB.Preload("Products").First(&supplier, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Supplier not found"})
	}

	return c.JSON(fiber.Map{
		"supplier": supplier,
	})
}

func CreateSupplier(c *fiber.Ctx) error {
	req := new(SupplierRequest)
	if err := c.BodyParser(req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	if req.Name == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Name is required"})
	}

	supplier := models.Supplier{
		Name:        req.Name,
		ContactName: req.ContactName,
		Phone:       req.Phone,
		Email:       req.Email,
		Address:     req.Address,
	}

	if err := config.DB.Create(&supplier).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create supplier"})
	}

	return c.Status(201).JSON(fiber.Map{
		"message":  "Supplier created successfully",
		"supplier": supplier,
	})
}

func UpdateSupplier(c *fiber.Ctx) error {
	id := c.Params("id")

	var supplier models.Supplier
	if err := config.DB.First(&supplier, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Supplier not found"})
	}

	req := new(SupplierRequest)
	if err := c.BodyParser(req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	if req.Name != "" {
		supplier.Name = req.Name
	}
	if req.ContactName != "" {
		supplier.ContactName = req.ContactName
	}
	if req.Phone != "" {
		supplier.Phone = req.Phone
	}
	if req.Email != "" {
		supplier.Email = req.Email
	}
	if req.Address != "" {
		supplier.Address = req.Address
	}

	if err := config.DB.Save(&supplier).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to update supplier"})
	}

	return c.JSON(fiber.Map{
		"message":  "Supplier updated successfully",
		"supplier": supplier,
	})
}

func DeleteSupplier(c *fiber.Ctx) error {
	id := c.Params("id")

	var supplier models.Supplier
	if err := config.DB.First(&supplier, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Supplier not found"})
	}

	// Check if supplier has products
	var productCount int64
	config.DB.Model(&models.Product{}).Where("supplier_id = ?", id).Count(&productCount)
	if productCount > 0 {
		return c.Status(400).JSON(fiber.Map{
			"error": "Cannot delete supplier with existing products",
		})
	}

	if err := config.DB.Delete(&supplier).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to delete supplier"})
	}

	return c.JSON(fiber.Map{
		"message": "Supplier deleted successfully",
	})
}