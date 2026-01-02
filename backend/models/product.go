package models

import (
	"time"

	"gorm.io/gorm"
)

type Product struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	SKU         string         `gorm:"type:varchar(50);unique;not null" json:"sku"`
	Name        string         `gorm:"type:varchar(200);not null" json:"name"`
	Description string         `gorm:"type:text" json:"description"`
	Price       float64        `gorm:"type:decimal(15,2);not null" json:"price"`
	Stock       int            `gorm:"default:0" json:"stock"`
	MinStock    int            `gorm:"default:10" json:"min_stock"` // Alert jika stock < min_stock
	ImageURL    string         `gorm:"type:varchar(255)" json:"image_url"`
	SupplierID  uint           `gorm:"not null" json:"supplier_id"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
	
	// Relations
	Supplier     Supplier       `gorm:"foreignKey:SupplierID" json:"supplier,omitempty"`
	StockHistory []StockHistory `gorm:"foreignKey:ProductID" json:"stock_history,omitempty"`
}