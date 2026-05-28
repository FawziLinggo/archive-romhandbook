package handlers

import (
	"database/sql"
	"strconv"

	"backend-api/internal/repositories"
	"backend-api/internal/utils"

	"github.com/gin-gonic/gin"
)

type EquipmentHandler struct {
	DB *sql.DB
}

func (h *EquipmentHandler) GetEquipments(
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

	equipmentType :=
		c.DefaultQuery("type", "")

	quality :=
		c.DefaultQuery("quality", "")

	stat :=
		c.DefaultQuery("stat", "")

	unlock :=
		c.DefaultQuery("unlock", "")

	depo :=
		c.DefaultQuery("depo", "")

	sort :=
		c.DefaultQuery("sort", "Name asc")

	equipments, total, hasNext, err :=
		repositories.GetEquipments(
			h.DB,
			page,
			limit,
			query,
			equipmentType,
			quality,
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
		equipments,
		gin.H{
			"page":     page,
			"limit":    limit,
			"total":    total,
			"has_next": hasNext,
		},
	)
}

func (h *EquipmentHandler) SearchEquipments(
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

	equipments, total, hasNext, err :=
		repositories.SearchEquipments(
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
		equipments,
		gin.H{
			"page":     page,
			"limit":    limit,
			"total":    total,
			"has_next": hasNext,
		},
	)
}

func (h *EquipmentHandler) GetEquipmentByID(
	c *gin.Context,
) {
	id :=
		c.Param("id")

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

	utils.Success(
		c,
		200,
		equipment,
		nil,
	)
}

func (h *EquipmentHandler) GetEquipmentFormulas(
	c *gin.Context,
) {
	id :=
		c.Param("id")

	formulas, err :=
		repositories.GetEquipmentFormulas(
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
