package controllers

import (
	"inventory-backend/config"
	"inventory-backend/models"

	"github.com/gofiber/fiber/v2"
)

type StockUpdateRequest struct {
	Type     string `json:"type"`     // "in" atau "out"
	Quantity int    `json:"quantity"` // jumlah
	Note     string `json:"note"`     // catatan
}

// Update Stock (Stock In / Out)
func UpdateStock(c *fiber.Ctx) error {
	productID := c.Params("id")

	var product models.Product
	if err := config.DB.First(&product, productID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Product not found"})
	}

	req := new(StockUpdateRequest)
	if err := c.BodyParser(req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	// Validasi
	if req.Type == "" || req.Quantity <= 0 {
		return c.Status(400).JSON(fiber.Map{"error": "Type and quantity are required"})
	}

	if req.Type != "in" && req.Type != "out" {
		return c.Status(400).JSON(fiber.Map{"error": "Type must be 'in' or 'out'"})
	}

	stockBefore := product.Stock
	var stockAfter int

	if req.Type == "in" {
		stockAfter = stockBefore + req.Quantity
	} else {
		if stockBefore < req.Quantity {
			return c.Status(400).JSON(fiber.Map{"error": "Insufficient stock"})
		}
		stockAfter = stockBefore - req.Quantity
	}

	// Update product stock
	product.Stock = stockAfter
	if err := config.DB.Save(&product).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to update stock"})
	}

	// Create stock history
	history := models.StockHistory{
		ProductID:   product.ID,
		Type:        req.Type,
		Quantity:    req.Quantity,
		Note:        req.Note,
		StockBefore: stockBefore,
		StockAfter:  stockAfter,
	}

	if err := config.DB.Create(&history).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create stock history"})
	}

	return c.JSON(fiber.Map{
		"message":      "Stock updated successfully",
		"stock_before": stockBefore,
		"stock_after":  stockAfter,
		"product":      product,
	})
}

// Get Stock History
func GetStockHistory(c *fiber.Ctx) error {
	productID := c.Params("id")

	var product models.Product
	if err := config.DB.First(&product, productID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Product not found"})
	}

	var history []models.StockHistory
	if err := config.DB.Where("product_id = ?", productID).
		Order("created_at DESC").
		Find(&history).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch stock history"})
	}

	return c.JSON(fiber.Map{
		"product": fiber.Map{
			"id":    product.ID,
			"name":  product.Name,
			"stock": product.Stock,
		},
		"history": history,
	})
}