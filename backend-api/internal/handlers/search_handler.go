package handlers

import (
	"database/sql"
	"strconv"

	"backend-api/internal/repositories"
	"backend-api/internal/utils"

	"github.com/gin-gonic/gin"
)

type SearchHandler struct {
	DB *sql.DB
}

func (h *SearchHandler) GlobalSearch(
	c *gin.Context,
) {
	query :=
		c.Query("query")

	limit, _ :=
		strconv.Atoi(
			c.DefaultQuery("limit", "30"),
		)

	results, err :=
		repositories.GlobalSearch(
			h.DB,
			query,
			limit,
		)

	if err != nil {
		utils.Error(c, 500, err.Error())
		return
	}

	utils.Success(
		c,
		200,
		results,
		gin.H{
			"query": query,
			"limit": limit,
			"count": len(results),
		},
	)
}
