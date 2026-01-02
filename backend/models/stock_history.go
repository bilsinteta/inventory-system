package models

import "time"

type StockHistory struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	ProductID   uint      `gorm:"not null" json:"product_id"`
	Type        string    `gorm:"type:enum('in','out');not null" json:"type"` // in = stock masuk, out = stock keluar
	Quantity    int       `gorm:"not null" json:"quantity"`
	Note        string    `gorm:"type:text" json:"note"`
	StockBefore int       `gorm:"not null" json:"stock_before"`
	StockAfter  int       `gorm:"not null" json:"stock_after"`
	CreatedAt   time.Time `json:"created_at"`
	
	// Relations
	Product Product `gorm:"foreignKey:ProductID" json:"product,omitempty"`
}