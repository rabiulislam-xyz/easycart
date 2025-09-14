package config

import (
	"os"
)

type Config struct {
	DBHost        string
	DBPort        string
	DBUser        string
	DBPassword    string
	DBName        string
	MinIOEndpoint string
	MinIOAccessKey string
	MinIOSecretKey string
	MinIOBucket   string
	MinIOUseSSL   bool
	JWTSecret     string
	Port          string
}

func Load() *Config {
	return &Config{
		DBHost:        getEnv("DB_HOST", "localhost"),
		DBPort:        getEnv("DB_PORT", "5432"),
		DBUser:        getEnv("DB_USER", "postgres"),
		DBPassword:    getEnv("DB_PASSWORD", "postgres"),
		DBName:        getEnv("DB_NAME", "easycart"),
		MinIOEndpoint: getEnv("MINIO_ENDPOINT", "localhost:9000"),
		MinIOAccessKey: getEnv("MINIO_ACCESS_KEY", "minioadmin"),
		MinIOSecretKey: getEnv("MINIO_SECRET_KEY", "minioadmin"),
		MinIOBucket:   getEnv("MINIO_BUCKET", "easycart-uploads"),
		MinIOUseSSL:   getEnv("MINIO_USE_SSL", "false") == "true",
		JWTSecret:     getEnv("JWT_SECRET", "your-secret-key"),
		Port:          getEnv("PORT", "8080"),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}