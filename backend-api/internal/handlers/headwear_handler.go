package handlers

import (
	"database/sql"
	"strconv"

	"backend-api/internal/repositories"
	"backend-api/internal/utils"

	"github.com/gin-gonic/gin"
)

type HeadwearHandler struct {
	DB *sql.DB
}

func (h *HeadwearHandler) GetHeadwears(
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
		utils.NormalizePagination(
			page,
			limit,
		)

	query :=
		c.DefaultQuery("query", "")

	position :=
		c.DefaultQuery("position", "")

	stat :=
		c.DefaultQuery("stat", "")

	unlock :=
		c.DefaultQuery("unlock", "")

	depo :=
		c.DefaultQuery("depo", "")

	sort :=
		c.DefaultQuery("sort", "Name asc")

	headwears, total, hasNext, err :=
		repositories.GetHeadwears(
			h.DB,
			page,
			limit,
			query,
			position,
			stat,
			unlock,
			depo,
			sort,
		)

	if err != nil {
		utils.Error(c, 500, err.Error())
		return
	}

	utils.Success(
		c,
		200,
		headwears,
		gin.H{
			"page":     page,
			"limit":    limit,
			"total":    total,
			"has_next": hasNext,
		},
	)
}

func (h *HeadwearHandler) SearchHeadwears(
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

	headwears, total, hasNext, err :=
		repositories.SearchHeadwears(
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
		headwears,
		gin.H{
			"page":     page,
			"limit":    limit,
			"total":    total,
			"has_next": hasNext,
		},
	)
}

func (h *HeadwearHandler) GetHeadwearByID(
	c *gin.Context,
) {
	id :=
		c.Param("id")

	headwear, err :=
		repositories.GetHeadwearByID(
			h.DB,
			id,
		)

	if err != nil {
		utils.Error(c, 500, err.Error())
		return
	}

	if headwear == nil {
		utils.Error(c, 404, "Headwear not found")
		return
	}

	utils.Success(
		c,
		200,
		headwear,
		nil,
	)
}

func (h *HeadwearHandler) GetHeadwearFormulas(
	c *gin.Context,
) {
	id :=
		c.Param("id")

	formulas, err :=
		repositories.GetHeadwearFormulas(
			h.DB,
			id,
		)

	if err != nil {
		utils.Error(c, 500, err.Error())
		return
	}

	utils.Success(
		c,
		200,
		formulas,
		nil,
	)
}
