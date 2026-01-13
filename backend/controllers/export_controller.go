package controllers

import (
	"fmt"
	"inventory-backend/config"
	"inventory-backend/models"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/jung-kurt/gofpdf"
	"github.com/xuri/excelize/v2"
)

// ExportProducts generates an Excel file of all products
func ExportProducts(c *fiber.Ctx) error {
	var products []models.Product
	if err := config.DB.Preload("Category").Preload("Supplier").Find(&products).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch products"})
	}

	f := excelize.NewFile()
	sheetName := "Products"
	index, _ := f.NewSheet(sheetName)
	f.SetActiveSheet(index)

	// Headers
	headers := []string{"ID", "SKU", "Name", "Category", "Supplier", "Stock", "Price", "Total Value"}
	for i, header := range headers {
		cell, _ := excelize.CoordinatesToCellName(i+1, 1)
		f.SetCellValue(sheetName, cell, header)
		f.SetColWidth(sheetName, string(rune('A'+i)), string(rune('A'+i)), 20)
	}

	// Style Header
	style, _ := f.NewStyle(&excelize.Style{
		Font: &excelize.Font{Bold: true},
		Fill: excelize.Fill{Type: "pattern", Color: []string{"#CCCCCC"}, Pattern: 1},
	})
	f.SetCellStyle(sheetName, "A1", "H1", style)

	// Data
	for i, p := range products {
		row := i + 2
		f.SetCellValue(sheetName, fmt.Sprintf("A%d", row), p.ID)
		f.SetCellValue(sheetName, fmt.Sprintf("B%d", row), p.SKU)
		f.SetCellValue(sheetName, fmt.Sprintf("C%d", row), p.Name)

		categoryName := "-"
		if p.CategoryID != nil {
			categoryName = p.Category.Name
		}
		f.SetCellValue(sheetName, fmt.Sprintf("D%d", row), categoryName)

		supplierName := "-"
		if p.Supplier.Name != "" {
			supplierName = p.Supplier.Name
		}
		f.SetCellValue(sheetName, fmt.Sprintf("E%d", row), supplierName)

		f.SetCellValue(sheetName, fmt.Sprintf("F%d", row), p.Stock)
		f.SetCellValue(sheetName, fmt.Sprintf("G%d", row), p.Price)
		f.SetCellValue(sheetName, fmt.Sprintf("H%d", row), float64(p.Stock)*p.Price)
	}

	// Buffer
	buf, err := f.WriteToBuffer()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to generate excel"})
	}

	fileName := fmt.Sprintf("inventory_export_%s.xlsx", time.Now().Format("20060102_150405"))
	c.Set("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
	c.Set("Content-Disposition", fmt.Sprintf("attachment; filename=%s", fileName))

	return c.SendStream(buf)
}

// ExportActivityLogs generates a PDF of activity logs
func ExportActivityLogs(c *fiber.Ctx) error {
	var logs []models.ActivityLog
	// Optional filter logic can be added here
	if err := config.DB.Preload("User").Order("created_at desc").Limit(100).Find(&logs).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch logs"})
	}

	pdf := gofpdf.New("P", "mm", "A4", "")
	pdf.AddPage()
	pdf.SetFont("Arial", "B", 16)
	pdf.Cell(40, 10, "Activity Logs Report")
	pdf.Ln(12)

	pdf.SetFont("Arial", "", 10)
	pdf.Cell(0, 10, fmt.Sprintf("Generated on: %s", time.Now().Format("2006-01-02 15:04:05")))
	pdf.Ln(12)

	// Table Header
	pdf.SetFont("Arial", "B", 10)
	pdf.SetFillColor(240, 240, 240)
	pdf.CellFormat(10, 10, "ID", "1", 0, "", true, 0, "")
	pdf.CellFormat(30, 10, "User", "1", 0, "", true, 0, "")
	pdf.CellFormat(20, 10, "Action", "1", 0, "", true, 0, "")
	pdf.CellFormat(30, 10, "Entity", "1", 0, "", true, 0, "")
	pdf.CellFormat(60, 10, "Details", "1", 0, "", true, 0, "")
	pdf.CellFormat(40, 10, "Time", "1", 0, "", true, 0, "")
	pdf.Ln(-1)

	// Table Rows
	pdf.SetFont("Arial", "", 9)
	for _, log := range logs {
		pdf.CellFormat(10, 8, strconv.Itoa(int(log.ID)), "1", 0, "", false, 0, "")
		userName := "Unknown"
		if log.User.Name != "" {
			userName = log.User.Name
		} else {
			userName = fmt.Sprintf("User %d", log.UserID)
		}
		pdf.CellFormat(30, 8, userName, "1", 0, "", false, 0, "")
		pdf.CellFormat(20, 8, log.Action, "1", 0, "", false, 0, "")
		pdf.CellFormat(30, 8, log.Entity, "1", 0, "", false, 0, "")

		// Truncate details if too long
		details := log.Details
		if len(details) > 35 {
			details = details[:32] + "..."
		}
		pdf.CellFormat(60, 8, details, "1", 0, "", false, 0, "")

		pdf.CellFormat(40, 8, log.CreatedAt.Format("2006-01-02 15:04"), "1", 0, "", false, 0, "")
		pdf.Ln(-1)
	}

	c.Set("Content-Type", "application/pdf")
	c.Set("Content-Disposition", fmt.Sprintf("attachment; filename=logs_report_%s.pdf", time.Now().Format("20060102")))

	return pdf.Output(c.Response().BodyWriter())
}
