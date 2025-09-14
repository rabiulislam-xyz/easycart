package services

import (
	"context"
	"fmt"
	"mime/multipart"
	"path/filepath"
	"strings"
	"time"

	"easycart/internal/config"
	"github.com/google/uuid"
	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

type MinIOService struct {
	client     *minio.Client
	bucketName string
	endpoint   string
	useSSL     bool
}

func NewMinIOService(cfg *config.Config) (*MinIOService, error) {
	client, err := minio.New(cfg.MinIOEndpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(cfg.MinIOAccessKey, cfg.MinIOSecretKey, ""),
		Secure: cfg.MinIOUseSSL,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create MinIO client: %w", err)
	}

	service := &MinIOService{
		client:     client,
		bucketName: cfg.MinIOBucket,
		endpoint:   cfg.MinIOEndpoint,
		useSSL:     cfg.MinIOUseSSL,
	}

	// Ensure bucket exists
	if err := service.ensureBucket(); err != nil {
		return nil, fmt.Errorf("failed to ensure bucket exists: %w", err)
	}

	return service, nil
}

func (s *MinIOService) ensureBucket() error {
	ctx := context.Background()
	
	exists, err := s.client.BucketExists(ctx, s.bucketName)
	if err != nil {
		return err
	}

	if !exists {
		err = s.client.MakeBucket(ctx, s.bucketName, minio.MakeBucketOptions{})
		if err != nil {
			return err
		}

		// Set bucket policy to allow read access for uploaded files
		policy := fmt.Sprintf(`{
			"Version": "2012-10-17",
			"Statement": [
				{
					"Effect": "Allow",
					"Principal": {"AWS": "*"},
					"Action": "s3:GetObject",
					"Resource": "arn:aws:s3:::%s/*"
				}
			]
		}`, s.bucketName)

		err = s.client.SetBucketPolicy(ctx, s.bucketName, policy)
		if err != nil {
			return err
		}
	}

	return nil
}

func (s *MinIOService) UploadFile(file multipart.File, header *multipart.FileHeader, folder string) (*FileUploadResult, error) {
	// Generate unique filename
	ext := filepath.Ext(header.Filename)
	filename := fmt.Sprintf("%s%s", uuid.New().String(), ext)
	objectName := filepath.Join(folder, filename)

	// Get file size
	fileSize := header.Size

	// Upload file
	ctx := context.Background()
	_, err := s.client.PutObject(ctx, s.bucketName, objectName, file, fileSize, minio.PutObjectOptions{
		ContentType: header.Header.Get("Content-Type"),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to upload file: %w", err)
	}

	// Generate file URL
	protocol := "http"
	if s.useSSL {
		protocol = "https"
	}
	
	fileURL := fmt.Sprintf("%s://%s/%s/%s", protocol, s.endpoint, s.bucketName, objectName)

	return &FileUploadResult{
		Filename: filename,
		URL:      fileURL,
		Size:     fileSize,
		MimeType: header.Header.Get("Content-Type"),
	}, nil
}

func (s *MinIOService) DeleteFile(objectName string) error {
	ctx := context.Background()
	return s.client.RemoveObject(ctx, s.bucketName, objectName, minio.RemoveObjectOptions{})
}

func (s *MinIOService) GetPresignedURL(objectName string, expiry time.Duration) (string, error) {
	ctx := context.Background()
	url, err := s.client.PresignedGetObject(ctx, s.bucketName, objectName, expiry, nil)
	if err != nil {
		return "", err
	}
	return url.String(), nil
}

type FileUploadResult struct {
	Filename string `json:"filename"`
	URL      string `json:"url"`
	Size     int64  `json:"size"`
	MimeType string `json:"mime_type"`
}

func IsValidImageType(mimeType string) bool {
	allowedTypes := []string{
		"image/jpeg",
		"image/jpg", 
		"image/png",
		"image/gif",
		"image/webp",
	}

	mimeType = strings.ToLower(mimeType)
	for _, allowed := range allowedTypes {
		if mimeType == allowed {
			return true
		}
	}
	return false
}