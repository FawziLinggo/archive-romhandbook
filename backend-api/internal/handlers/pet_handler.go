package handlers

import (
	"database/sql"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"backend-api/internal/repositories"
	"backend-api/internal/utils"
)

type PetHandler struct {
	DB *sql.DB
}

func (h *PetHandler) GetPets(
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
	// REPOSITORY
	// =====================

	pets, total, hasNext, err := repositories.GetPets(

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
		gin.H{

			"success": true,
			"data":    pets,
			"meta": gin.H{
				"page":     page,
				"limit":    limit,
				"total":    total,
				"has_next": hasNext,
			},
		},
	)
}

func (h *PetHandler) GetPetBySlug(

	c *gin.Context,

) {

	slug :=
		c.Param("slug")

	pet, err :=
		repositories.GetPetBySlug(

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

	if pet == nil {

		utils.Error(

			c,

			404,

			"Pet not found",
		)

		return
	}

	utils.Success(

		c,

		200,

		pet,

		nil,
	)
}

func (h *PetHandler) SearchPets(
	c *gin.Context,
) {
	query :=
		c.Query("query")

	page, _ :=
		strconv.Atoi(
			c.DefaultQuery("page", "1"),
		)

	limit, _ :=
		strconv.Atoi(
			c.DefaultQuery("limit", "24"),
		)

	if page <= 0 {
		page = 1
	}

	if limit <= 0 || limit > 24 {
		limit = 24
	}

	pets, total, hasNext, err :=
		repositories.SearchPets(
			h.DB,
			query,
			page,
			limit,
		)

	if err != nil {
		utils.Error(
			c,
			500,
			err.Error(),
		)

		return
	}

	utils.Success(
		c,
		200,
		pets,
		gin.H{
			"page":     page,
			"limit":    limit,
			"total":    total,
			"has_next": hasNext,
		},
	)
}
