package services

import (
	"fmt"
	"inventory-backend/models"
	"strconv"
	"time"

	"io"

	"github.com/jung-kurt/gofpdf"
	"github.com/xuri/excelize/v2"
)

// GenerateProductExcel creates an Excel file from the product list
func GenerateProductExcel(products []models.Product, writer io.Writer) error {
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

	return f.Write(writer)
}

// GenerateActivityLogPDF creates a PDF file from activity logs
func GenerateActivityLogPDF(logs []models.ActivityLog, writer io.Writer) error {
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

	return pdf.Output(writer)
}
