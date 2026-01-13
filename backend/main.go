package main

import (
	"inventory-backend/config"
	"inventory-backend/models"
	"inventory-backend/routes"
	"inventory-backend/utils"
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/joho/godotenv"
)

func main() {
	// Load .env
	if err := godotenv.Load(); err != nil {
		log.Println("Warning: .env file not found")
	}

	// Connect DB
	config.ConnectDB()

	// Auto Migrate
	if err := config.DB.AutoMigrate(
		&models.User{},
		&models.Supplier{},
		&models.Product{},
		&models.StockHistory{},
		&models.ActivityLog{},
	); err != nil {
		log.Fatal("Failed to migrate database:", err)
	}
	log.Println("✅ Database migrated successfully!")

	// Seed data (optional)
	seedData()

	// Create uploads folder
	uploadPath := os.Getenv("UPLOAD_PATH")
	if uploadPath == "" {
		uploadPath = "./uploads"
	}
	if err := os.MkdirAll(uploadPath, os.ModePerm); err != nil {
		log.Fatal("Failed to create uploads folder:", err)
	}

	// Initialize Fiber
	app := fiber.New(fiber.Config{
		BodyLimit: 10 * 1024 * 1024, // 10MB for file uploads
		ErrorHandler: func(c *fiber.Ctx, err error) error {
			return c.Status(500).JSON(fiber.Map{
				"error": err.Error(),
			})
		},
	})

	// Middleware
	app.Use(logger.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
	}))

	// Serve static files (uploads)
	app.Static("/uploads", uploadPath)

	// Setup routes
	routes.SetupRoutes(app)

	// Health check
	app.Get("/", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"message": "Inventory System API is running!",
			"version": "1.0.0",
		})
	})

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8081"
	}

	log.Printf("🚀 Server running on http://localhost:%s", port)
	if err := app.Listen(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}

func seedData() {
	// Seed Suppliers
	var count int64
	config.DB.Model(&models.Supplier{}).Count(&count)

	if count == 0 {
		suppliers := []models.Supplier{
			{Name: "PT Sumber Makmur Sejahtera", ContactName: "Budi Santoso", Phone: "081234567890", Email: "budi@sumbermakmur.com"},
			{Name: "PT Global Teknologi Indonesia", ContactName: "Siti Aminah", Phone: "081234567891", Email: "siti@globaltech.id"},
			{Name: "CV Maju Bersama Abadi", ContactName: "Andi Wijaya", Phone: "081234567892", Email: "andi@majubersama.com"},
			{Name: "PT Cipta Kreasi Digital", ContactName: "Dewi Lestari", Phone: "081234567893", Email: "dewi@ciptakreasi.com"},
			{Name: "UD Berkah Alam Semesta", ContactName: "Rudi Hartono", Phone: "081234567894", Email: "rudi@berkahalam.com"},
		}
		config.DB.Create(&suppliers)
		log.Println("✅ Default suppliers seeded!")
	}

	// Seed Master Admin
	var userCount int64
	config.DB.Model(&models.User{}).Where("email = ?", "admin").Count(&userCount)

	if userCount == 0 {
		hashedPassword, _ := utils.HashPassword("admin123")
		admin := models.User{
			Name:     "Master Admin",
			Email:    "admin",
			Password: hashedPassword,
			Role:     "admin",
			IsActive: true,
		}
		config.DB.Create(&admin)
		log.Println("✅ Master Admin seeded (Email: admin, Pass: admin123)")
	}
}
