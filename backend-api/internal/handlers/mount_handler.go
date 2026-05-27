package handlers

import (
	"database/sql"
	"strconv"

	"backend-api/internal/repositories"
	"backend-api/internal/utils"

	"github.com/gin-gonic/gin"
)

type MountHandler struct {
	DB *sql.DB
}

func (h *MountHandler) GetMounts(
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

	mounts, total, hasNext, err :=
		repositories.GetMounts(
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
		mounts,
		gin.H{
			"page":     page,
			"limit":    limit,
			"total":    total,
			"has_next": hasNext,
		},
	)
}

func (h *MountHandler) SearchMounts(
	c *gin.Context,
) {
	query :=
		c.Query("query")

	mounts, err :=
		repositories.SearchMounts(
			h.DB,
			query,
		)

	if err != nil {
		utils.Error(c, 500, err.Error())
		return
	}

	utils.Success(c, 200, mounts, nil)
}

func (h *MountHandler) GetMountByID(
	c *gin.Context,
) {
	id :=
		c.Param("id")

	mount, err :=
		repositories.GetMountByID(
			h.DB,
			id,
		)

	if err != nil {
		utils.Error(c, 500, err.Error())
		return
	}

	if mount == nil {
		utils.Error(c, 404, "Mount not found")
		return
	}

	utils.Success(c, 200, mount, nil)
}
