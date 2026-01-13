package controllers

import (
	"fmt"
	"inventory-backend/config"
	"inventory-backend/models"
	"inventory-backend/utils"
	"os"
	"strconv"
	"strings"
	"time"

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
	CategoryID  *uint   `json:"category_id"`
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
	categoryID := c.Query("category_id")

	query := config.DB.Preload("Supplier").Preload("Category")

	if search != "" {
		query = query.Where("name LIKE ? OR sku LIKE ?", "%"+search+"%", "%"+search+"%")
	}

	if categoryID != "" {
		query = query.Where("category_id = ?", categoryID)
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

	if err := config.DB.Preload("Supplier").Preload("Category").Preload("StockHistory").First(&product, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Product not found"})
	}

	return c.JSON(fiber.Map{"product": product})
}

// Create Product dengan Upload Image
func CreateProduct(c *fiber.Ctx) error {
	// Parse SKU/Quantity etc from Form Data
	sku := c.FormValue("sku")
	name := c.FormValue("name")
	desc := c.FormValue("description")
	price, _ := strconv.ParseFloat(c.FormValue("price"), 64)
	stock, _ := strconv.Atoi(c.FormValue("stock"))
	minStock, _ := strconv.Atoi(c.FormValue("min_stock"))
	supplierID, _ := strconv.Atoi(c.FormValue("supplier_id"))
	categoryID, _ := strconv.Atoi(c.FormValue("category_id"))

	// Validasi
	if sku == "" || name == "" || price <= 0 || supplierID == 0 {
		return c.Status(400).JSON(fiber.Map{"error": "SKU, Name, Price, and Supplier are required"})
	}

	// Cek SKU Unik (Handle Soft Delete collision)
	var existingProduct models.Product
	if err := config.DB.Unscoped().Where("sku = ?", sku).First(&existingProduct).Error; err == nil {
		if existingProduct.DeletedAt.Valid {
			// SKU collision with deleted product -> Rename old product
			newSKU := fmt.Sprintf("%s_DELETED_%d", existingProduct.SKU, time.Now().Unix())
			config.DB.Model(&existingProduct).Update("sku", newSKU)
		} else {
			return c.Status(400).JSON(fiber.Map{"error": "SKU already exists"})
		}
	}

	// Handle Image Upload
	var imageURL string
	if file, err := c.FormFile("image"); err == nil {
		filename := fmt.Sprintf("%d_%s", time.Now().Unix(), file.Filename)
		path := fmt.Sprintf("./uploads/%s", filename)

		if err := c.SaveFile(file, path); err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "Failed to save image"})
		}
		imageURL = "/uploads/" + filename
	}

	// Assign CategoryID safely
	var catIDPtr *uint
	if categoryID != 0 {
		cid := uint(categoryID)
		catIDPtr = &cid
	}

	product := models.Product{
		SKU:         sku,
		Name:        name,
		Description: desc,
		Price:       price,
		Stock:       stock,
		MinStock:    minStock,
		SupplierID:  uint(supplierID),
		CategoryID:  catIDPtr,
		ImageURL:    imageURL,
	}

	if err := config.DB.Create(&product).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create product"})
	}

	// Log Activity
	userID, _ := c.Locals("userID").(uint)
	utils.LogActivity(userID, "CREATE", "Product", product.ID, fmt.Sprintf("Created product: %s (%s)", product.Name, product.SKU))

	return c.JSON(fiber.Map{
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
	categoryIDStr := c.FormValue("category_id")

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

	if categoryIDStr != "" {
		categoryID, _ := strconv.Atoi(categoryIDStr)
		// Validation could refer to checking if category exists
		var category models.Category
		if err := config.DB.First(&category, categoryID).Error; err != nil {
			return c.Status(404).JSON(fiber.Map{"error": "Category not found"})
		}
		cid := uint(categoryID)
		product.CategoryID = &cid
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

	// Log Activity
	userID, _ := c.Locals("userID").(uint)
	utils.LogActivity(userID, "UPDATE", "Product", product.ID, "Updated product: "+product.Name+" ("+product.SKU+")")

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

	// Smart Delete: Rename SKU to release it
	originalSKU := product.SKU
	product.SKU = fmt.Sprintf("%s_DELETED_%d", product.SKU, time.Now().Unix())
	config.DB.Save(&product)

	if err := config.DB.Delete(&product).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to delete product"})
	}

	// Log Activity
	userID, _ := c.Locals("userID").(uint)
	utils.LogActivity(userID, "DELETE", "Product", product.ID, "Deleted product: "+product.Name+" ("+originalSKU+")")

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
