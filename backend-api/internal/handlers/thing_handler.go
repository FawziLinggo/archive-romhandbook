package handlers

import (
	"database/sql"
	"net/http"

	"backend-api/internal/repositories"

	"github.com/gin-gonic/gin"
)

type ThingHandler struct {
	DB *sql.DB
}

func (h *ThingHandler) GetThingByID(
	c *gin.Context,
) {
	id :=
		c.Param("id")

	thing, err :=
		repositories.GetThingTypeByID(
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

	if thing == nil {
		c.JSON(
			http.StatusNotFound,
			gin.H{
				"success": false,
				"message": "Thing not found",
			},
		)

		return
	}

	switch thing.Type {

	case "pet_egg":
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
					"message": "Pet egg not found",
				},
			)

			return
		}

		c.JSON(
			http.StatusOK,
			gin.H{
				"success": true,
				"type":    thing.Type,
				"data":    egg,
				"meta":    nil,
			},
		)

		return

	case "mount":
		mount, err :=
			repositories.GetMountByID(
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

		if mount == nil {
			c.JSON(
				http.StatusNotFound,
				gin.H{
					"success": false,
					"message": "Mount not found",
				},
			)

			return
		}

		c.JSON(
			http.StatusOK,
			gin.H{
				"success": true,
				"type":    thing.Type,
				"data":    mount,
				"meta":    nil,
			},
		)

		return

	default:
		c.JSON(
			http.StatusNotImplemented,
			gin.H{
				"success": false,
				"type":    thing.Type,
				"message": "Thing type is not implemented yet",
			},
		)

		return
	}
}
