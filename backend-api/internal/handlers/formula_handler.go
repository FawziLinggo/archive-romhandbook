package handlers

import (
	"database/sql"
	"strconv"

	"backend-api/internal/repositories"
	"backend-api/internal/utils"

	"github.com/gin-gonic/gin"
)

type FormulaHandler struct {
	DB *sql.DB
}

func normalizePageLimit(
	page int,
	limit int,
) (
	int,
	int,
) {
	if page <= 0 {
		page = 1
	}

	if limit <= 0 || limit > 24 {
		limit = 24
	}

	return page, limit
}

func (h *FormulaHandler) GetFormulas(
	c *gin.Context,
) {
	page, _ :=
		strconv.Atoi(
			c.DefaultQuery("page", "1"),
		)

	limit, _ :=
		strconv.Atoi(
			c.DefaultQuery("limit", "20"),
		)

	query :=
		c.DefaultQuery("query", "")

	page, limit =
		normalizePageLimit(
			page,
			limit,
		)

	formulas, total, hasNext, err :=
		repositories.GetFormulas(
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
		formulas,
		gin.H{
			"page":     page,
			"limit":    limit,
			"total":    total,
			"has_next": hasNext,
		},
	)
}

func (h *FormulaHandler) SearchFormulas(
	c *gin.Context,
) {
	page, _ :=
		strconv.Atoi(
			c.DefaultQuery("page", "1"),
		)

	limit, _ :=
		strconv.Atoi(
			c.DefaultQuery("limit", "20"),
		)

	query :=
		c.DefaultQuery("query", "")

	page, limit =
		normalizePageLimit(
			page,
			limit,
		)

	formulas, total, hasNext, err :=
		repositories.SearchFormulas(
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
		formulas,
		gin.H{
			"page":     page,
			"limit":    limit,
			"total":    total,
			"has_next": hasNext,
		},
	)
}

func (h *FormulaHandler) GetFeaturedFormula(
	c *gin.Context,
) {
	formula, err :=
		repositories.GetFeaturedFormula(
			h.DB,
		)

	if err != nil {
		utils.Error(c, 500, err.Error())
		return
	}

	if formula == nil {
		utils.Error(c, 404, "Formula not found")
		return
	}

	utils.Success(c, 200, formula, nil)
}

func (h *FormulaHandler) GetFormulaBySlug(
	c *gin.Context,
) {
	slug :=
		c.Param("slug")

	formula, err :=
		repositories.GetFormulaBySlug(
			h.DB,
			slug,
		)

	if err != nil {
		utils.Error(c, 500, err.Error())
		return
	}

	if formula == nil {
		utils.Error(c, 404, "Formula not found")
		return
	}

	utils.Success(c, 200, formula, nil)
}

func (h *FormulaHandler) GetFormulaGraphByID(
	c *gin.Context,
) {

	nodeType :=
		c.DefaultQuery("node_type", "")

	edgeType :=
		c.DefaultQuery("edge_type", "")

	formulaID :=
		c.Param("slug")

	depth, _ :=
		strconv.Atoi(
			c.DefaultQuery("depth", "1"),
		)

	limit, _ :=
		strconv.Atoi(
			c.DefaultQuery("limit", "250"),
		)

	graph, err :=
		repositories.GetFormulaGraphByID(
			h.DB,
			formulaID,
			depth,
			limit,
			edgeType,
			nodeType,
		)

	if err != nil {
		utils.Error(c, 500, err.Error())
		return
	}

	if graph == nil {
		utils.Error(c, 404, "Formula graph not found")
		return
	}

	utils.Success(
		c,
		200,
		graph,
		gin.H{
			"formula_id": formulaID,
			"depth":      graph.Depth,
			"node_count": len(graph.Nodes),
			"edge_count": len(graph.Edges),
		},
	)
}

func (h *FormulaHandler) GetFormulaGraphSummaryByID(
	c *gin.Context,
) {
	formulaID :=
		c.Param("slug")

	edgeType :=
		c.DefaultQuery("edge_type", "")

	summary, err :=
		repositories.GetFormulaGraphSummaryByID(
			h.DB,
			formulaID,
			edgeType,
		)

	if err != nil {
		utils.Error(c, 500, err.Error())
		return
	}

	if summary == nil {
		utils.Error(c, 404, "Formula graph summary not found")
		return
	}

	utils.Success(
		c,
		200,
		summary,
		gin.H{
			"formula_id": formulaID,
			"node_types": len(summary.NodeTypes),
		},
	)
}
