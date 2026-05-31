package handlers

import (
	"database/sql"
	"strconv"

	"backend-api/internal/repositories"
	"backend-api/internal/utils"

	"github.com/gin-gonic/gin"
)

type MapHandler struct {
	DB *sql.DB
}

func normalizeMapPagination(
	page int,
	limit int,
) (
	int,
	int,
) {
	if page <= 0 {
		page = 1
	}

	if limit <= 0 || limit > 48 {
		limit = 24
	}

	return page, limit
}

func (h *MapHandler) GetMaps(
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

	page, limit =
		normalizeMapPagination(page, limit)

	query :=
		c.DefaultQuery("query", "")

	maps, total, hasNext, err :=
		repositories.GetMaps(
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
		maps,
		gin.H{
			"page":     page,
			"limit":    limit,
			"total":    total,
			"has_next": hasNext,
		},
	)
}

func (h *MapHandler) GetMapBySlug(
	c *gin.Context,
) {
	slug :=
		c.Param("slug")

	item, err :=
		repositories.GetMapBySlug(
			h.DB,
			slug,
		)

	if err != nil {
		utils.Error(c, 500, err.Error())
		return
	}

	if item == nil {
		utils.Error(c, 404, "Map not found")
		return
	}

	utils.Success(
		c,
		200,
		item,
		nil,
	)
}
