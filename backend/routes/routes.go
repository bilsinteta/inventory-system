package routes

import (
	"inventory-backend/controllers"
	"inventory-backend/middleware"

	"github.com/gofiber/fiber/v2"
)

func SetupRoutes(app *fiber.App) {
	api := app.Group("/api")

	// Auth Routes (Public)
	auth := api.Group("/auth")
	auth.Post("/register", controllers.Register)
	auth.Post("/login", controllers.Login)

	// Protected Routes
	protected := api.Group("/", middleware.AuthRequired)

	// Suppliers
	suppliers := protected.Group("/suppliers")
	suppliers.Get("/", controllers.GetSuppliers)
	suppliers.Get("/:id", controllers.GetSupplier)
	suppliers.Post("/", controllers.CreateSupplier)
	suppliers.Put("/:id", controllers.UpdateSupplier)
	suppliers.Delete("/:id", controllers.DeleteSupplier)

	// Products
	products := protected.Group("/products")
	products.Get("/", controllers.GetProducts)
	products.Get("/low-stock", controllers.GetLowStockProducts) // Harus di atas /:id
	products.Get("/:id", controllers.GetProduct)
	products.Post("/", controllers.CreateProduct)
	products.Put("/:id", controllers.UpdateProduct)
	products.Delete("/:id", controllers.DeleteProduct)

	// Stock Management
	products.Post("/:id/stock", controllers.UpdateStock)
	products.Get("/:id/history", controllers.GetStockHistory)

	// Admin Routes
	admin := protected.Group("/admin", middleware.AdminOnly) // Assuming middleware.AdminRequired needs to be implemented or reused
	admin.Get("/users", controllers.GetAllUsers)             // New endpoint to get all users
	admin.Get("/users/pending", controllers.GetPendingUsers)
	admin.Get("/logs", controllers.GetActivityLogs) // Audit Logs
	admin.Put("/users/:id/approve", controllers.ApproveUser)
	admin.Delete("/users/:id", controllers.DeleteUser)
}
