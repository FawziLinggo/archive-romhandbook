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
		"/api/v1/things/random-snapshot-card",
		thingHandler.GetRandomSnapshotCard,
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

	mountHandler :=
		handlers.MountHandler{
			DB: db,
		}

	router.GET(
		"/api/v1/mounts",
		mountHandler.GetMounts,
	)

	router.GET(
		"/api/v1/mounts/search",
		mountHandler.SearchMounts,
	)

	router.GET(
		"/api/v1/mounts/:id",
		mountHandler.GetMountByID,
	)

	buffHandler :=
		handlers.BuffHandler{
			DB: db,
		}

	router.GET(
		"/api/v1/buffs",
		buffHandler.GetBuffs,
	)

	router.GET(
		"/api/v1/buffs/search",
		buffHandler.SearchBuffs,
	)

	router.GET(
		"/api/v1/buffs/:slug",
		buffHandler.GetBuffBySlug,
	)

	formulaHandler :=
		handlers.FormulaHandler{
			DB: db,
		}

	router.GET(
		"/api/v1/formulas",
		formulaHandler.GetFormulas,
	)

	router.GET(
		"/api/v1/formulas/search",
		formulaHandler.SearchFormulas,
	)

	router.GET(
		"/api/v1/formulas/featured",
		formulaHandler.GetFeaturedFormula,
	)

	router.GET(
		"/api/v1/formulas/:slug",
		formulaHandler.GetFormulaBySlug,
	)
}
