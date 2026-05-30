package routes

import (
	"database/sql"

	"github.com/gin-gonic/gin"

	"backend-api/configs"
	"backend-api/internal/app/auth"
	"backend-api/internal/app/comments"
	featureRequests "backend-api/internal/app/feature_requests"
	"backend-api/internal/app/points"
	"backend-api/internal/app/profile"
	"backend-api/internal/app/reports"
	"backend-api/internal/handlers"
)

func SetupRoutes(
	router *gin.Engine,
	db *sql.DB,
	appDB *sql.DB,
	config *configs.Config,
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

	authHandler := auth.NewHandler(
		appDB, auth.Config{
			FrontendURL:  config.FrontendURL,
			ClientID:     config.DiscordClientID,
			ClientSecret: config.DiscordClientSecret,
			RedirectURL:  config.DiscordRedirectURL,
		},
	)

	profileHandler :=
		profile.NewHandler(
			appDB,
			db,
		)

	api.GET(
		"/me/profile",
		profileHandler.GetProfile,
	)

	api.PATCH(
		"/me/profile",
		profileHandler.UpdateProfile,
	)

	api.GET(
		"/auth/discord/login",
		authHandler.DiscordLogin,
	)

	api.GET(
		"/auth/discord/callback",
		authHandler.DiscordCallback,
	)

	api.GET(
		"/auth/me",
		authHandler.Me,
	)

	api.POST(
		"/auth/logout",
		authHandler.Logout,
	)

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
		"/api/v1/graph/meta",
		formulaHandler.GetFormulaGraphMeta,
	)

	router.GET(
		"/api/v1/graph/search/nodes",
		formulaHandler.SearchFormulaGraphNodes,
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

	pointRepository :=
		points.NewRepository(appDB)

	pointService :=
		points.NewService(pointRepository)

	featureRequestRepository :=
		featureRequests.NewRepository(appDB)

	featureRequestService :=
		featureRequests.NewService(
			featureRequestRepository,
			pointService,
		)

	featureRequestHandler :=
		featureRequests.NewHandler(featureRequestService)

	reportRepository :=
		reports.NewRepository(appDB)

	reportService :=
		reports.NewService(
			reportRepository,
			pointService,
		)

	reportHandler :=
		reports.NewHandler(reportService)

	api.GET(
		"/me/reports",
		reportHandler.ListReports,
	)

	api.POST(
		"/me/reports",
		reportHandler.CreateReport,
	)

	api.GET(
		"/me/reports/:id",
		reportHandler.GetReport,
	)

	api.PATCH(
		"/me/reports/:id",
		reportHandler.UpdateReport,
	)

	api.DELETE(
		"/me/reports/:id",
		reportHandler.DeleteReport,
	)

	api.GET(
		"/admin/reports",
		reportHandler.ListAdminReports,
	)

	api.PATCH(
		"/admin/reports/:id/status",
		reportHandler.UpdateAdminReportStatus,
	)

	commentRepository :=
		comments.NewRepository(appDB)

	commentService :=
		comments.NewService(
			commentRepository,
			pointService,
		)

	commentHandler :=
		comments.NewHandler(commentService)

	api.GET(
		"/comments",
		commentHandler.ListComments,
	)

	api.POST(
		"/comments",
		commentHandler.CreateComment,
	)

	api.PATCH(
		"/comments/:id",
		commentHandler.UpdateComment,
	)

	api.DELETE(
		"/comments/:id",
		commentHandler.DeleteComment,
	)

	api.GET(
		"/me/feature-requests",
		featureRequestHandler.ListUser,
	)

	api.POST(
		"/me/feature-requests",
		featureRequestHandler.Create,
	)

	api.GET(
		"/me/feature-requests/:id",
		featureRequestHandler.GetUser,
	)

	api.PATCH(
		"/me/feature-requests/:id",
		featureRequestHandler.Update,
	)

	api.DELETE(
		"/me/feature-requests/:id",
		featureRequestHandler.Delete,
	)

	api.GET(
		"/admin/feature-requests",
		featureRequestHandler.ListAdmin,
	)

	api.PATCH(
		"/admin/feature-requests/:id/status",
		featureRequestHandler.UpdateAdminStatus,
	)
}
