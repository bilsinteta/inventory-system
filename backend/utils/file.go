package utils

import (
	"fmt"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/google/uuid"
)

// Generate unique filename
func GenerateFileName(originalName string) string {
	ext := filepath.Ext(originalName)
	timestamp := time.Now().Unix()
	uniqueID := uuid.New().String()[:8]
	return fmt.Sprintf("%d_%s%s", timestamp, uniqueID, ext)
}

// Save uploaded file
func SaveUploadedFile(file *multipart.FileHeader, uploadPath string) (string, error) {
	// Validasi file extension
	ext := strings.ToLower(filepath.Ext(file.Filename))
	allowedExts := []string{".jpg", ".jpeg", ".png", ".gif", ".webp"}
	
	isAllowed := false
	for _, allowed := range allowedExts {
		if ext == allowed {
			isAllowed = true
			break
		}
	}
	
	if !isAllowed {
		return "", fmt.Errorf("file type not allowed. Only images are allowed")
	}

	// Validasi file size (max 5MB)
	if file.Size > 5*1024*1024 {
		return "", fmt.Errorf("file size too large. Max 5MB")
	}

	// Buat folder upload jika belum ada
	if err := os.MkdirAll(uploadPath, os.ModePerm); err != nil {
		return "", err
	}

	// Generate filename
	fileName := GenerateFileName(file.Filename)
	filePath := filepath.Join(uploadPath, fileName)

	// Open uploaded file
	src, err := file.Open()
	if err != nil {
		return "", err
	}
	defer src.Close()

	// Create destination file
	dst, err := os.Create(filePath)
	if err != nil {
		return "", err
	}
	defer dst.Close()

	// Copy file
	if _, err := dst.ReadFrom(src); err != nil {
		return "", err
	}

	return fileName, nil
}

// Delete file
func DeleteFile(fileName, uploadPath string) error {
	filePath := filepath.Join(uploadPath, fileName)
	return os.Remove(filePath)
}