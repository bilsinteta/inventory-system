package utils

import (
	"inventory-backend/config"
	"inventory-backend/models"
	"log"
)

func LogActivity(userID uint, action, entity string, entityID uint, details string) {
	activity := models.ActivityLog{
		UserID:   userID,
		Action:   action,
		Entity:   entity,
		EntityID: entityID,
		Details:  details,
	}

	if err := config.DB.Create(&activity).Error; err != nil {
		log.Printf("Failed to create activity log: %v", err)
	}
}
