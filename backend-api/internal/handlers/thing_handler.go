package handlers

import (
	"database/sql"
	"net/http"

	"backend-api/internal/repositories"
	"backend-api/internal/utils"

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

	case "card":
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

		c.JSON(
			200,
			gin.H{
				"success": true,
				"type":    thing.Type,
				"data":    card,
				"meta":    nil,
			},
		)

		return

	case "headwear":
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

		c.JSON(
			200,
			gin.H{
				"success": true,
				"type":    thing.Type,
				"data":    headwear,
				"meta":    nil,
			},
		)

		return

	case "equipment":
		equipment, err :=
			repositories.GetEquipmentByID(
				h.DB,
				id,
			)

		if err != nil {
			utils.Error(c, 500, err.Error())
			return
		}

		if equipment == nil {
			utils.Error(c, 404, "Equipment not found")
			return
		}

		c.JSON(
			200,
			gin.H{
				"success": true,
				"type":    thing.Type,
				"data":    equipment,
				"meta":    nil,
			},
		)

		return

	case "furniture":
		furniture, err :=
			repositories.GetFurnitureByID(
				h.DB,
				id,
			)

		if err != nil {
			utils.Error(c, 500, err.Error())
			return
		}

		if furniture == nil {
			utils.Error(c, 404, "Furniture not found")
			return
		}

		c.JSON(
			200,
			gin.H{
				"success": true,
				"type":    thing.Type,
				"data":    furniture,
				"meta":    nil,
			},
		)

		return

	case "cooking_ingredient":
		ingredient, err :=
			repositories.GetCookingIngredientByID(
				h.DB,
				id,
			)

		if err != nil {
			utils.Error(c, 500, err.Error())
			return
		}

		if ingredient == nil {
			utils.Error(c, 404, "Cooking ingredient not found")
			return
		}

		c.JSON(
			200,
			gin.H{
				"success": true,
				"type":    thing.Type,
				"data":    ingredient,
				"meta":    nil,
			},
		)

		return

	case "pet_headwear_unlock_item":
		item, err :=
			repositories.GetPetHeadwearUnlockItemByID(
				h.DB,
				id,
			)

		if err != nil {
			utils.Error(c, 500, err.Error())
			return
		}

		if item == nil {
			utils.Error(c, 404, "Pet headwear unlock item not found")
			return
		}

		c.JSON(
			200,
			gin.H{
				"success": true,
				"type":    thing.Type,
				"data":    item,
				"meta":    nil,
			},
		)

		return

	case "crafting_material":
		material, err :=
			repositories.GetCraftingMaterialByID(
				h.DB,
				id,
			)

		if err != nil {
			utils.Error(c, 500, err.Error())
			return
		}

		if material == nil {
			utils.Error(c, 404, "Crafting material not found")
			return
		}

		c.JSON(
			200,
			gin.H{
				"success": true,
				"type":    thing.Type,
				"data":    material,
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

func (h *ThingHandler) GetRandomSnapshotCard(
	c *gin.Context,
) {
	card, err :=
		repositories.GetRandomSnapshotCard(
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

	if card == nil {
		utils.Error(
			c,
			404,
			"Snapshot card not found",
		)

		return
	}

	utils.Success(
		c,
		200,
		card,
		nil,
	)
}
