package handlers

import (
	"database/sql"
	"strconv"

	"backend-api/internal/repositories"
	"backend-api/internal/utils"

	"github.com/gin-gonic/gin"
)

type AncientEquipHandler struct {
	DB *sql.DB
}

func normalizeAncientEquipPagination(
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

func (h *AncientEquipHandler) GetAncientEquips(
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
		normalizeAncientEquipPagination(page, limit)

	query :=
		c.DefaultQuery("query", "")

	items, total, hasNext, err :=
		repositories.GetAncientEquips(
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
		items,
		gin.H{
			"page":     page,
			"limit":    limit,
			"total":    total,
			"has_next": hasNext,
		},
	)
}

func (h *AncientEquipHandler) GetAncientEquipBySlug(
	c *gin.Context,
) {
	slug :=
		c.Param("slug")

	item, err :=
		repositories.GetAncientEquipBySlug(
			h.DB,
			slug,
		)

	if err != nil {
		utils.Error(c, 500, err.Error())
		return
	}

	if item == nil {
		utils.Error(c, 404, "Ancient equip not found")
		return
	}

	utils.Success(
		c,
		200,
		item,
		nil,
	)

}
