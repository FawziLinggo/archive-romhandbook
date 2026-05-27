package main

import (
	"log"

	"github.com/gin-contrib/cors"

	"github.com/gin-gonic/gin"

	"backend-api/configs"

	"backend-api/internal/database"
	"backend-api/internal/routes"
)

func main() {

	// =====================
	// LOAD CONFIG
	// =====================

	config :=
		configs.LoadConfig()

	// =====================
	// DATABASE
	// =====================

	db, err := database.NewSQLite(

		config.DatabasePath,
	)

	if err != nil {

		log.Fatal(err)
	}

	// =====================
	// GIN
	// =====================

	router := gin.Default()

	router.Use(cors.Default())

	// =====================
	// ROUTES
	// =====================

	routes.SetupRoutes(
		router,
		db,
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
