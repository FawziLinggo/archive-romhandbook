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

	petHandler :=
		handlers.PetHandler{

			DB: db,
		}

	thingHandler :=
		handlers.ThingHandler{

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

	router.GET(
		"/api/v1/pets",
		petHandler.GetPets,
	)

	router.GET(
		"/api/v1/pets/search",
		petHandler.SearchPets,
	)

	router.GET(
		"/api/v1/pets/:slug",
		petHandler.GetPetBySlug,
	)

	router.GET(
		"/api/v1/things/:id",
		thingHandler.GetThingByID,
	)

	petEggHandler :=
		handlers.NewPetEggHandler(db)

	router.GET(

		"/api/v1/pet-eggs/:id",

		petEggHandler.GetEggByID,
	)
}
