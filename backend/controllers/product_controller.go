package controllers

import (
	"inventory-backend/config"
	"inventory-backend/models"
	"inventory-backend/utils"
	"os"
	"strconv"
	"strings"

	"github.com/gofiber/fiber/v2"
)

type ProductRequest struct {
	SKU         string  `json:"sku"`
	Name        string  `json:"name"`
	Description string  `json:"description"`
	Price       float64 `json:"price"`
	Stock       int     `json:"stock"`
	MinStock    int     `json:"min_stock"`
	SupplierID  uint    `json:"supplier_id"`
}

// Get All Products dengan Search & Pagination
func GetProducts(c *fiber.Ctx) error {
	var products []models.Product
	
	// Pagination
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "10"))
	offset := (page - 1) * limit

	// Search
	search := c.Query("search")
	
	query := config.DB.Preload("Supplier")
	
	if search != "" {
		query = query.Where("name LIKE ? OR sku LIKE ?", "%"+search+"%", "%"+search+"%")
	}

	// Count total
	var total int64
	query.Model(&models.Product{}).Count(&total)

	// Get products
	if err := query.Offset(offset).Limit(limit).Find(&products).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch products"})
	}

	return c.JSON(fiber.Map{
		"products": products,
		"pagination": fiber.Map{
			"page":        page,
			"limit":       limit,
			"total":       total,
			"total_pages": (total + int64(limit) - 1) / int64(limit),
		},
	})
}

// Get Single Product
func GetProduct(c *fiber.Ctx) error {
	id := c.Params("id")

	var product models.Product
	if err := config.DB.Preload("Supplier").Preload("StockHistory").First(&product, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Product not found"})
	}

	return c.JSON(fiber.Map{
		"product": product,
	})
}

// Create Product dengan Upload Image
func CreateProduct(c *fiber.Ctx) error {
	// Parse form data
	sku := c.FormValue("sku")
	name := c.FormValue("name")
	description := c.FormValue("description")
	priceStr := c.FormValue("price")
	stockStr := c.FormValue("stock")
	minStockStr := c.FormValue("min_stock")
	supplierIDStr := c.FormValue("supplier_id")

	// Validasi
	if sku == "" || name == "" || priceStr == "" || supplierIDStr == "" {
		return c.Status(400).JSON(fiber.Map{"error": "SKU, name, price, and supplier_id are required"})
	}

	price, _ := strconv.ParseFloat(priceStr, 64)
	stock, _ := strconv.Atoi(stockStr)
	minStock, _ := strconv.Atoi(minStockStr)
	supplierID, _ := strconv.ParseUint(supplierIDStr, 10, 32)

	// Check if SKU already exists
	var existingProduct models.Product
	if err := config.DB.Where("sku = ?", sku).First(&existingProduct).Error; err == nil {
		return c.Status(400).JSON(fiber.Map{"error": "SKU already exists"})
	}

	// Check if supplier exists
	var supplier models.Supplier
	if err := config.DB.First(&supplier, supplierID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Supplier not found"})
	}

	// Handle image upload
	var imageURL string
	file, err := c.FormFile("image")
	if err == nil {
		uploadPath := os.Getenv("UPLOAD_PATH")
		if uploadPath == "" {
			uploadPath = "./uploads"
		}

		fileName, err := utils.SaveUploadedFile(file, uploadPath)
		if err != nil {
			return c.Status(400).JSON(fiber.Map{"error": err.Error()})
		}
		imageURL = "/uploads/" + fileName
	}

	product := models.Product{
		SKU:         sku,
		Name:        name,
		Description: description,
		Price:       price,
		Stock:       stock,
		MinStock:    minStock,
		ImageURL:    imageURL,
		SupplierID:  uint(supplierID),
	}

	if err := config.DB.Create(&product).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create product"})
	}

	// Load supplier relation
	config.DB.Preload("Supplier").First(&product, product.ID)

	return c.Status(201).JSON(fiber.Map{
		"message": "Product created successfully",
		"product": product,
	})
}

// Update Product
func UpdateProduct(c *fiber.Ctx) error {
	id := c.Params("id")

	var product models.Product
	if err := config.DB.First(&product, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Product not found"})
	}

	// Parse form data
	sku := c.FormValue("sku")
	name := c.FormValue("name")
	description := c.FormValue("description")
	priceStr := c.FormValue("price")
	stockStr := c.FormValue("stock")
	minStockStr := c.FormValue("min_stock")
	supplierIDStr := c.FormValue("supplier_id")

	// Update fields
	if sku != "" && sku != product.SKU {
		// Check if new SKU already exists
		var existingProduct models.Product
		if err := config.DB.Where("sku = ? AND id != ?", sku, id).First(&existingProduct).Error; err == nil {
			return c.Status(400).JSON(fiber.Map{"error": "SKU already exists"})
		}
		product.SKU = sku
	}

	if name != "" {
		product.Name = name
	}
	if description != "" {
		product.Description = description
	}
	if priceStr != "" {
		price, _ := strconv.ParseFloat(priceStr, 64)
		product.Price = price
	}
	if stockStr != "" {
		stock, _ := strconv.Atoi(stockStr)
		product.Stock = stock
	}
	if minStockStr != "" {
		minStock, _ := strconv.Atoi(minStockStr)
		product.MinStock = minStock
	}
	if supplierIDStr != "" {
		supplierID, _ := strconv.ParseUint(supplierIDStr, 10, 32)
		var supplier models.Supplier
		if err := config.DB.First(&supplier, supplierID).Error; err != nil {
			return c.Status(404).JSON(fiber.Map{"error": "Supplier not found"})
		}
		product.SupplierID = uint(supplierID)
	}

	// Handle image upload
	file, err := c.FormFile("image")
	if err == nil {
		uploadPath := os.Getenv("UPLOAD_PATH")
		if uploadPath == "" {
			uploadPath = "./uploads"
		}

		// Delete old image if exists
		if product.ImageURL != "" {
			oldFileName := strings.Replace(product.ImageURL, "/uploads/", "", 1)
			utils.DeleteFile(oldFileName, uploadPath)
		}

		fileName, err := utils.SaveUploadedFile(file, uploadPath)
		if err != nil {
			return c.Status(400).JSON(fiber.Map{"error": err.Error()})
		}
		product.ImageURL = "/uploads/" + fileName
	}

	if err := config.DB.Save(&product).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to update product"})
	}

	// Load supplier relation
	config.DB.Preload("Supplier").First(&product, product.ID)

	return c.JSON(fiber.Map{
		"message": "Product updated successfully",
		"product": product,
	})
}

// Delete Product
func DeleteProduct(c *fiber.Ctx) error {
	id := c.Params("id")

	var product models.Product
	if err := config.DB.First(&product, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Product not found"})
	}

	// Delete image if exists
	if product.ImageURL != "" {
		uploadPath := os.Getenv("UPLOAD_PATH")
		if uploadPath == "" {
			uploadPath = "./uploads"
		}
		fileName := strings.Replace(product.ImageURL, "/uploads/", "", 1)
		utils.DeleteFile(fileName, uploadPath)
	}

	if err := config.DB.Delete(&product).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to delete product"})
	}

	return c.JSON(fiber.Map{
		"message": "Product deleted successfully",
	})
}

// Get Low Stock Products (stock < min_stock)
func GetLowStockProducts(c *fiber.Ctx) error {
	var products []models.Product
	
	if err := config.DB.Preload("Supplier").
		Where("stock < min_stock").
		Find(&products).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch low stock products"})
	}

	return c.JSON(fiber.Map{
		"products": products,
		"count":    len(products),
	})
}