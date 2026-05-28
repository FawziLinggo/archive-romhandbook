package handlers

import (
	"database/sql"
	"strconv"

	"backend-api/internal/repositories"
	"backend-api/internal/utils"

	"github.com/gin-gonic/gin"
)

type JobHandler struct {
	DB *sql.DB
}

func (h *JobHandler) GetJobs(
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

	page, limit =
		utils.NormalizePagination(page, limit)

	limit = 200
	jobs, total, hasNext, err :=
		repositories.GetJobs(
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
		jobs,
		gin.H{
			"page":     page,
			"limit":    limit,
			"total":    total,
			"has_next": hasNext,
		},
	)
}

func (h *JobHandler) SearchJobs(
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
		utils.NormalizePagination(page, limit)

	jobs, total, hasNext, err :=
		repositories.SearchJobs(
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
		jobs,
		gin.H{
			"page":     page,
			"limit":    limit,
			"total":    total,
			"has_next": hasNext,
		},
	)
}

func (h *JobHandler) GetJobBySlug(
	c *gin.Context,
) {
	slug :=
		c.Param("slug")

	job, err :=
		repositories.GetJobBySlug(
			h.DB,
			slug,
		)

	if err != nil {
		utils.Error(c, 500, err.Error())
		return
	}

	if job == nil {
		utils.Error(c, 404, "Job not found")
		return
	}

	utils.Success(c, 200, job, nil)
}
