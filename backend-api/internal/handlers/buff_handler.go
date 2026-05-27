package handlers

import (
	"database/sql"
	"strconv"

	"backend-api/internal/repositories"
	"backend-api/internal/utils"

	"github.com/gin-gonic/gin"
)

type BuffHandler struct {
	DB *sql.DB
}

func (h *BuffHandler) GetBuffs(
	c *gin.Context,
) {
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

	if page <= 0 {
		page = 1
	}

	if limit <= 0 {
		limit = 24
	}

	buffs, total, hasNext, err :=
		repositories.GetBuffs(
			h.DB,
			page,
			limit,
			query,
		)

	if err != nil {
		utils.Error(c, 500, err.Error())
		return
	}

	utils.Success(
		c,
		200,
		buffs,
		gin.H{
			"page":     page,
			"limit":    limit,
			"total":    total,
			"has_next": hasNext,
		},
	)
}

func (h *BuffHandler) SearchBuffs(
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

	page, limit =
		utils.NormalizePagination(
			page,
			limit,
		)

	buffs, total, hasNext, err :=
		repositories.SearchBuffs(
			h.DB,
			query,
			page,
			limit,
		)

	if err != nil {
		utils.Error(c, 500, err.Error())
		return
	}

	utils.Success(
		c,
		200,
		buffs,
		gin.H{
			"page":     page,
			"limit":    limit,
			"total":    total,
			"has_next": hasNext,
		},
	)
}

func (h *BuffHandler) GetBuffBySlug(
	c *gin.Context,
) {
	slug :=
		c.Param("slug")

	buff, err :=
		repositories.GetBuffBySlug(
			h.DB,
			slug,
		)

	if err != nil {
		utils.Error(c, 500, err.Error())
		return
	}

	if buff == nil {
		utils.Error(c, 404, "Buff not found")
		return
	}

	utils.Success(c, 200, buff, nil)
}
