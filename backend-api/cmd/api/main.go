package main

import (
	"log"

	"github.com/gin-contrib/cors"

	"github.com/gin-gonic/gin"

	"backend-api/configs"

	"backend-api/internal/app/appdb"
	"backend-api/internal/database"
	"backend-api/internal/routes"
)

func main() {

	// =====================
	// LOAD CONFIG
	// =====================

	config :=
		configs.LoadConfig()

	log.Printf("discord client id configured: %v", config.DiscordClientID != "")
	log.Printf("discord secret configured: %v", config.DiscordClientSecret != "")
	log.Printf("discord redirect url configured: %v", config.DiscordRedirectURL != "")

	// =====================
	// DATABASE
	// =====================
	archiveDB, err := database.NewSQLite(
		config.DatabasePath,
	)

	if err != nil {
		log.Fatal(err)
	}

	appDB, err := database.NewSQLite(
		config.AppDatabasePath,
	)

	if err != nil {
		log.Fatal(err)
	}

	err = appdb.Migrate(appDB)

	if err != nil {
		log.Fatal(err)
	}

	// =====================
	// GIN
	// =====================

	router := gin.Default()

	router.Use(cors.New(cors.Config{
		AllowOrigins: []string{
			config.FrontendURL,
			"http://localhost:3000",
			"http://127.0.0.1:3000",
		},
		AllowMethods: []string{
			"GET",
			"POST",
			"PUT",
			"PATCH",
			"DELETE",
			"OPTIONS",
		},
		AllowHeaders: []string{
			"Origin",
			"Content-Type",
			"Accept",
			"Authorization",
		},
		AllowCredentials: true,
	}))

	// =====================
	// ROUTES
	// =====================

	routes.SetupRoutes(
		router,
		archiveDB,
		appDB,
		config,
	)

	// =====================
	// START
	// =====================

	log.Printf(
		"server running on :%s",
		config.AppPort,
	)

	router.Run(
		":" + config.AppPort,
	)
}
