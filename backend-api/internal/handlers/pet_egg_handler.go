package handlers

import (
	"database/sql"
	"net/http"

	"backend-api/internal/repositories"

	"github.com/gin-gonic/gin"
)

type PetEggHandler struct {
	DB *sql.DB
}

func NewPetEggHandler(
	db *sql.DB,
) *PetEggHandler {

	return &PetEggHandler{
		DB: db,
	}
}

func (h *PetEggHandler) GetEggByID(

	c *gin.Context,

) {

	id :=
		c.Param("id")

	egg, err :=
		repositories.GetEggByID(

			h.DB,
			id,
		)

	if err != nil {

		c.JSON(

			http.StatusInternalServerError,

			gin.H{

				"success": false,
				"message": err.Error(),
			},
		)

		return
	}

	if egg == nil {

		c.JSON(

			http.StatusNotFound,

			gin.H{

				"success": false,
				"message": "Egg not found",
			},
		)

		return
	}

	c.JSON(

		http.StatusOK,

		gin.H{

			"success": true,
			"data":    egg,
		},
	)
}
