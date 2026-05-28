package handlers

import (
	"database/sql"
	"strconv"

	"backend-api/internal/repositories"
	"backend-api/internal/utils"

	"github.com/gin-gonic/gin"
)

type CardHandler struct {
	DB *sql.DB
}

func normalizeCardPagination(
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

func (h *CardHandler) GetCards(
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
		normalizeCardPagination(page, limit)

	query :=
		c.DefaultQuery("query", "")

	cardType :=
		c.DefaultQuery("type", "")

	quality :=
		c.DefaultQuery("quality", "")

	cards, total, hasNext, err :=
		repositories.GetCards(
			h.DB,
			page,
			limit,
			query,
			cardType,
			quality,
		)

	if err != nil {
		utils.Error(c, 500, err.Error())
		return
	}

	utils.Success(
		c,
		200,
		cards,
		gin.H{
			"page":     page,
			"limit":    limit,
			"total":    total,
			"has_next": hasNext,
		},
	)
}

func (h *CardHandler) SearchCards(
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
		normalizeCardPagination(page, limit)

	query :=
		c.DefaultQuery("query", "")

	cards, total, hasNext, err :=
		repositories.SearchCards(
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
		cards,
		gin.H{
			"page":     page,
			"limit":    limit,
			"total":    total,
			"has_next": hasNext,
		},
	)
}

func (h *CardHandler) GetCardByID(
	c *gin.Context,
) {
	id :=
		c.Param("id")

	card, err :=
		repositories.GetCardByID(
			h.DB,
			id,
		)

	if err != nil {
		utils.Error(c, 500, err.Error())
		return
	}

	if card == nil {
		utils.Error(c, 404, "Card not found")
		return
	}

	utils.Success(c, 200, card, nil)
}

func (h *CardHandler) GetCardFormulas(
	c *gin.Context,
) {
	id :=
		c.Param("id")

	formulas, err :=
		repositories.GetCardFormulas(
			h.DB,
			id,
		)

	if err != nil {
		utils.Error(c, 500, err.Error())
		return
	}

	utils.Success(c, 200, formulas, nil)
}
