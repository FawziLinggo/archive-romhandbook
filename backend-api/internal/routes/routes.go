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
		"/api/v1/formulas/:slug/graph/summary",
		formulaHandler.GetFormulaGraphSummaryByID,
	)

	router.GET(
		"/api/v1/graph/nodes/:node_type/:ref_id/relations",
		formulaHandler.GetFormulaGraphNodeRelations,
	)

	router.GET(
		"/api/v1/formulas/:slug/graph",
		formulaHandler.GetFormulaGraphByID,
	)

	router.GET(
		"/api/v1/formulas/:slug",
		formulaHandler.GetFormulaBySlug,
	)

	archiveHandler :=
		handlers.ArchiveHandler{
			DB: db,
		}

	router.GET(
		"/api/v1/archive/counts",
		archiveHandler.GetArchiveCounts,
	)

	cardHandler :=
		handlers.CardHandler{
			DB: db,
		}

	router.GET(
		"/api/v1/cards",
		cardHandler.GetCards,
	)

	router.GET(
		"/api/v1/cards/search",
		cardHandler.SearchCards,
	)

	router.GET(
		"/api/v1/cards/:id/formulas",
		cardHandler.GetCardFormulas,
	)

	router.GET(
		"/api/v1/cards/:id",
		cardHandler.GetCardByID,
	)

	monsterHandler :=
		handlers.MonsterHandler{
			DB: db,
		}

	router.GET(
		"/api/v1/monsters",
		monsterHandler.GetMonsters,
	)

	router.GET(
		"/api/v1/monsters/search",
		monsterHandler.SearchMonsters,
	)

	router.GET(
		"/api/v1/monsters/:slug",
		monsterHandler.GetMonsterBySlug,
	)

	headwearHandler :=
		handlers.HeadwearHandler{
			DB: db,
		}

	router.GET(
		"/api/v1/headwears",
		headwearHandler.GetHeadwears,
	)

	router.GET(
		"/api/v1/headwears/search",
		headwearHandler.SearchHeadwears,
	)

	router.GET(
		"/api/v1/headwears/:id/formulas",
		headwearHandler.GetHeadwearFormulas,
	)

	router.GET(
		"/api/v1/headwears/:id",
		headwearHandler.GetHeadwearByID,
	)

	equipmentHandler :=
		handlers.EquipmentHandler{
			DB: db,
		}

	router.GET(
		"/api/v1/equipments",
		equipmentHandler.GetEquipments,
	)

	router.GET(
		"/api/v1/equipments/search",
		equipmentHandler.SearchEquipments,
	)

	router.GET(
		"/api/v1/equipments/:id/formulas",
		equipmentHandler.GetEquipmentFormulas,
	)

	router.GET(
		"/api/v1/equipments/:id",
		equipmentHandler.GetEquipmentByID,
	)

	jobHandler :=
		handlers.JobHandler{

			DB: db,
		}

	router.GET(
		"/api/v1/jobs",
		jobHandler.GetJobs,
	)

	router.GET(
		"/api/v1/jobs/search",
		jobHandler.SearchJobs,
	)

	router.GET(
		"/api/v1/jobs/:slug",
		jobHandler.GetJobBySlug,
	)

	searchHandler :=
		handlers.SearchHandler{

			DB: db,
		}

	router.GET(
		"/api/v1/search",
		searchHandler.GlobalSearch,
	)

	dataHealthHandler :=
		handlers.DataHealthHandler{
			DB: db,
		}

	router.GET(
		"/api/v1/data-health/dashboard",
		dataHealthHandler.GetDataHealthDashboard,
	)
}
