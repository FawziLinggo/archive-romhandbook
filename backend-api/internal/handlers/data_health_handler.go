package handlers

import (
	"database/sql"

	"backend-api/internal/repositories"
	"backend-api/internal/utils"

	"github.com/gin-gonic/gin"
)

type DataHealthHandler struct {
	DB *sql.DB
}

func (h *DataHealthHandler) GetDataHealthDashboard(
	c *gin.Context,
) {
	dashboard, err :=
		repositories.GetDataHealthDashboard(
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
		dashboard,
		nil,
	)
}
