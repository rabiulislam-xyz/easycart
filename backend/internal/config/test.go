package config

import (
	"os"
)

func LoadTestConfig() *Config {
	return &Config{
		DBHost:     getEnvOrDefault("TEST_DB_HOST", "localhost"),
		DBPort:     getEnvOrDefault("TEST_DB_PORT", "5433"),
		DBUser:     getEnvOrDefault("TEST_DB_USER", "postgres"),
		DBPassword: getEnvOrDefault("TEST_DB_PASSWORD", "postgres"),
		DBName:     getEnvOrDefault("TEST_DB_NAME", "easycart_test"),
		JWTSecret:  "test-jwt-secret-key",
		Port:       "8081",
		
		// MinIO test config
		MinIOEndpoint:   "localhost:9000",
		MinIOAccessKey:  "minioadmin",
		MinIOSecretKey:  "minioadmin", 
		MinIOBucket:     "easycart-test",
		MinIOUseSSL:     false,
	}
}

func getEnvOrDefault(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}