package controllers

import (
	"fmt"
	"inventory-backend/config"
	"inventory-backend/models"
	"inventory-backend/services"
	"time"

	"github.com/gofiber/fiber/v2"
)

// ExportProducts generates an Excel file of all products
func ExportProducts(c *fiber.Ctx) error {
	var products []models.Product
	if err := config.DB.Preload("Category").Preload("Supplier").Find(&products).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch products"})
	}

	fileName := fmt.Sprintf("inventory_products_%s.xlsx", time.Now().Format("20060102_150405"))
	c.Set("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
	c.Set("Content-Disposition", fmt.Sprintf("attachment; filename=%s", fileName))

	return services.GenerateProductExcel(products, c.Response().BodyWriter())
}

// ExportActivityLogs generates a PDF of activity logs
func ExportActivityLogs(c *fiber.Ctx) error {
	var logs []models.ActivityLog
	// Optional filter logic can be added here
	if err := config.DB.Preload("User").Order("created_at desc").Limit(100).Find(&logs).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch logs"})
	}

	fileName := fmt.Sprintf("activity_logs_%s.pdf", time.Now().Format("20060102"))
	c.Set("Content-Type", "application/pdf")
	c.Set("Content-Disposition", fmt.Sprintf("attachment; filename=%s", fileName))

	return services.GenerateActivityLogPDF(logs, c.Response().BodyWriter())
}
