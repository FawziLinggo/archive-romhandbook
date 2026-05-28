package handlers

import (
	"database/sql"
	"strconv"

	"backend-api/internal/repositories"
	"backend-api/internal/utils"

	"github.com/gin-gonic/gin"
)

type MonsterHandler struct {
	DB *sql.DB
}

func normalizeMonsterPagination(
	page int,
	limit int,
) (
	int,
	int,
) {
	if page <= 0 {
		page = 1
	}

	if limit <= 0 || limit > 24 {
		limit = 24
	}

	return page, limit
}

func (h *MonsterHandler) GetMonsters(
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
		normalizeMonsterPagination(page, limit)

	query :=
		c.DefaultQuery("query", "")

	size :=
		c.DefaultQuery("size", "")

	element :=
		c.DefaultQuery("element", "")

	race :=
		c.DefaultQuery("race", "")

	sort :=
		c.DefaultQuery("sort", "Name asc")

	monsters, total, hasNext, err :=
		repositories.GetMonsters(
			h.DB,
			page,
			limit,
			query,
			size,
			element,
			race,
			sort,
		)

	if err != nil {
		utils.Error(c, 500, err.Error())
		return
	}

	utils.Success(
		c,
		200,
		monsters,
		gin.H{
			"page":     page,
			"limit":    limit,
			"total":    total,
			"has_next": hasNext,
		},
	)
}

func (h *MonsterHandler) SearchMonsters(
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
		normalizeMonsterPagination(page, limit)

	query :=
		c.DefaultQuery("query", "")

	monsters, total, hasNext, err :=
		repositories.SearchMonsters(
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
		monsters,
		gin.H{
			"page":     page,
			"limit":    limit,
			"total":    total,
			"has_next": hasNext,
		},
	)
}

func (h *MonsterHandler) GetMonsterBySlug(
	c *gin.Context,
) {
	slug :=
		c.Param("slug")

	monster, err :=
		repositories.GetMonsterBySlug(
			h.DB,
			slug,
		)

	if err != nil {
		utils.Error(c, 500, err.Error())
		return
	}

	if monster == nil {
		utils.Error(c, 404, "Monster not found")
		return
	}

	utils.Success(c, 200, monster, nil)
}
