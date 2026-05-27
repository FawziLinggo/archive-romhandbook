package handlers

import (
	"database/sql"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"backend-api/internal/repositories"
	"backend-api/internal/services"
	"backend-api/internal/utils"
)

type SkillHandler struct {
	DB *sql.DB
}

func (h *SkillHandler) GetSkills(
	c *gin.Context,
) {

	// =====================
	// QUERY PARAMS
	// =====================

	page, _ :=
		strconv.Atoi(
			c.DefaultQuery("page", "1"),
		)

	limit, _ :=
		strconv.Atoi(
			c.DefaultQuery("limit", "24"),
		)

	query :=
		c.DefaultQuery("query", "")

	// =====================
	// VALIDATION
	// =====================

	if page <= 0 {

		page = 1
	}

	if limit <= 0 {

		limit = 24
	}

	// =====================
	// SERVICE
	// =====================

	response, err :=
		services.GetSkillsService(

			h.DB,

			page,
			limit,

			query,
		)

	if err != nil {

		c.JSON(

			http.StatusInternalServerError,

			gin.H{

				"success": false,
				"message": err.Error(),
			},
		)

		return
	}

	c.JSON(
		http.StatusOK,
		response,
	)
}

func (h *SkillHandler) GetSkillBySlug(

	c *gin.Context,

) {

	slug :=
		c.Param("slug")

	skill, err :=
		repositories.GetSkillBySlug(

			h.DB,

			slug,
		)

	if err != nil {

		utils.Error(

			c,

			500,

			err.Error(),
		)

		return
	}

	if skill == nil {

		utils.Error(

			c,

			404,

			"Skill not found",
		)

		return
	}

	utils.Success(

		c,

		200,

		skill,

		nil,
	)
}
