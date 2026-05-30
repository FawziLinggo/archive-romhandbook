package configs

import (
	"os"
)

type Config struct {
	AppPort string

	DatabasePath string

	AppDatabasePath string
	FrontendURL     string

	DiscordClientID     string
	DiscordClientSecret string
	DiscordRedirectURL  string
}

func LoadConfig() *Config {

	return &Config{

		AppPort: getEnv(
			"APP_PORT",
			getEnv("API_PORT", "8080"),
		),

		DatabasePath: getEnv(
			"DATABASE_PATH",
			"./storage/rom.db",
		),

		AppDatabasePath: getEnv(
			"APP_DATABASE_PATH",
			"./storage/app.db",
		),

		FrontendURL: getEnv(
			"FRONTEND_URL",
			"http://localhost:3000",
		),

		DiscordClientID: getEnv(
			"DISCORD_CLIENT_ID",
			"",
		),

		DiscordClientSecret: getEnv(
			"DISCORD_CLIENT_SECRET",
			"",
		),

		DiscordRedirectURL: getEnv(
			"DISCORD_REDIRECT_URL",
			"http://127.0.0.1:8080/api/v1/auth/discord/callback",
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
