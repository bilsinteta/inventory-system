package models

import "gorm.io/gorm"

type Category struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	Name        string         `gorm:"type:varchar(100);unique;not null" json:"name"`
	Description string         `gorm:"type:text" json:"description"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}
