package handlers

import (
	"database/sql"

	"backend-api/internal/repositories"
	"backend-api/internal/utils"

	"github.com/gin-gonic/gin"
)

type ArchiveHandler struct {
	DB *sql.DB
}

func (h *ArchiveHandler) GetArchiveCounts(
	c *gin.Context,
) {
	counts, err :=
		repositories.GetArchiveCounts(
			h.DB,
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
		counts,
		nil,
	)
}
