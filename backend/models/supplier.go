package models

import (
	"time"

	"gorm.io/gorm"
)

type Supplier struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	Name        string         `gorm:"type:varchar(100);not null" json:"name"`
	ContactName string         `gorm:"type:varchar(100)" json:"contact_name"`
	Phone       string         `gorm:"type:varchar(20)" json:"phone"`
	Email       string         `gorm:"type:varchar(100)" json:"email"`
	Address     string         `gorm:"type:text" json:"address"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
	
	// Relations
	Products []Product `gorm:"foreignKey:SupplierID" json:"products,omitempty"`
}