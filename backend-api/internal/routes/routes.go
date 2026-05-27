package routes

import (
	"database/sql"

	"github.com/gin-gonic/gin"

	"backend-api/internal/handlers"
)

func SetupRoutes(

	router *gin.Engine,
	db *sql.DB,

) {

	skillHandler :=
		handlers.SkillHandler{

			DB: db,
		}

	api := router.Group("/api/v1")

	{
		api.GET(
			"/skills",
			skillHandler.GetSkills,
		)
	}

	router.GET(

		"/api/v1/skills/:slug",

		skillHandler.GetSkillBySlug,
	)
}
