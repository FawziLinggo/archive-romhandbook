package configs

import (
	"os"
)

type Config struct {
	AppPort string

	DatabasePath string
}

func LoadConfig() *Config {

	return &Config{

		AppPort: getEnv(
			"APP_PORT",
			"8080",
		),

		DatabasePath: getEnv(
			"DATABASE_PATH",
			"./storage/rom.db",
		),
	}
}

func getEnv(

	key string,
	fallback string,

) string {

	value := os.Getenv(key)

	if value == "" {

		return fallback
	}

	return value
}
