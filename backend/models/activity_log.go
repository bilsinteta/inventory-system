package models

import (
	"time"

	"gorm.io/gorm"
)

type ActivityLog struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	UserID    uint           `json:"user_id"`
	User      User           `gorm:"foreignKey:UserID" json:"user"`
	Action    string         `gorm:"type:varchar(50);not null" json:"action"`
	Entity    string         `gorm:"type:varchar(50);not null" json:"entity"`
	EntityID  uint           `json:"entity_id"`
	Details   string         `gorm:"type:text" json:"details"`
	CreatedAt time.Time      `json:"created_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}
