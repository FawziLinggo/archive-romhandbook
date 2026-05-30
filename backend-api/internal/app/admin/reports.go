package admin

import (
	"database/sql"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

type ReportsHandler struct {
	DB *sql.DB
}

type AdminReport struct {
	ID         string  `json:"id"`
	UserID     string  `json:"user_id"`
	UserName   string  `json:"user_name"`
	UserEmail  *string `json:"user_email"`
	TargetType *string `json:"target_type"`
	TargetID   *string `json:"target_id"`
	TargetURL  *string `json:"target_url"`
	Title      string  `json:"title"`
	Body       string  `json:"body"`
	Status     string  `json:"status"`
	CreatedAt  string  `json:"created_at"`
	UpdatedAt  string  `json:"updated_at"`
}

type UpdateReportStatusRequest struct {
	Status string `json:"status"`
}

func NewReportsHandler(db *sql.DB) *ReportsHandler {
	return &ReportsHandler{
		DB: db,
	}
}

func (h *ReportsHandler) ListReports(c *gin.Context) {
	_, ok := RequireAdmin(c, h.DB)

	if !ok {
		return
	}

	status :=
		strings.TrimSpace(
			c.Query("status"),
		)

	limit :=
		parseLimit(
			c.Query("limit"),
			50,
			100,
		)

	args :=
		[]any{}

	where :=
		"WHERE r.status != 'deleted'"

	if status != "" {
		where += " AND r.status = ?"
		args = append(args, status)
	}

	args = append(args, limit)

	rows, err :=
		h.DB.Query(`
			SELECT
				r.id,
				r.user_id,
				COALESCE(u.display_name, 'Unknown User') AS user_name,
				u.email,
				r.target_type,
				r.target_id,
				r.target_url,
				r.title,
				r.body,
				r.status,
				r.created_at,
				r.updated_at
			FROM reports r
			LEFT JOIN users u
				ON u.id = r.user_id
			`+where+`
			ORDER BY r.created_at DESC
			LIMIT ?
		`, args...)

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

	defer rows.Close()

	reports :=
		[]AdminReport{}

	for rows.Next() {
		report, err :=
			scanAdminReport(rows)

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

		reports = append(reports, report)
	}

	c.JSON(
		http.StatusOK,
		gin.H{
			"success": true,
			"data":    reports,
		},
	)
}

func (h *ReportsHandler) UpdateReportStatus(c *gin.Context) {
	adminUserID, ok :=
		RequireAdmin(c, h.DB)

	if !ok {
		return
	}

	reportID :=
		strings.TrimSpace(
			c.Param("id"),
		)

	var request UpdateReportStatusRequest

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(
			http.StatusBadRequest,
			gin.H{
				"success": false,
				"message": "Invalid request body",
			},
		)

		return
	}

	status :=
		strings.TrimSpace(
			strings.ToLower(request.Status),
		)

	if !isAllowedReportStatus(status) {
		c.JSON(
			http.StatusBadRequest,
			gin.H{
				"success": false,
				"message": "Invalid report status",
			},
		)

		return
	}

	result, err :=
		h.DB.Exec(`
			UPDATE reports
			SET
				status = ?,
				updated_at = CURRENT_TIMESTAMP
			WHERE id = ?
			AND status != 'deleted'
		`, status, reportID)

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

	affected, _ :=
		result.RowsAffected()

	if affected == 0 {
		c.JSON(
			http.StatusNotFound,
			gin.H{
				"success": false,
				"message": "Report not found",
			},
		)

		return
	}

	report, err :=
		h.getReportByID(reportID)

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

	c.JSON(
		http.StatusOK,
		gin.H{
			"success": true,
			"data":    report,
			"meta": gin.H{
				"reviewed_by": adminUserID,
			},
		},
	)
}

func (h *ReportsHandler) getReportByID(id string) (AdminReport, error) {
	row :=
		h.DB.QueryRow(`
			SELECT
				r.id,
				r.user_id,
				COALESCE(u.display_name, 'Unknown User') AS user_name,
				u.email,
				r.target_type,
				r.target_id,
				r.target_url,
				r.title,
				r.body,
				r.status,
				r.created_at,
				r.updated_at
			FROM reports r
			LEFT JOIN users u
				ON u.id = r.user_id
			WHERE r.id = ?
			LIMIT 1
		`, id)

	return scanAdminReport(row)
}

type adminReportScanner interface {
	Scan(dest ...any) error
}

func scanAdminReport(scanner adminReportScanner) (AdminReport, error) {
	var report AdminReport

	var userEmail sql.NullString
	var targetType sql.NullString
	var targetID sql.NullString
	var targetURL sql.NullString

	err :=
		scanner.Scan(
			&report.ID,
			&report.UserID,
			&report.UserName,
			&userEmail,
			&targetType,
			&targetID,
			&targetURL,
			&report.Title,
			&report.Body,
			&report.Status,
			&report.CreatedAt,
			&report.UpdatedAt,
		)

	if err != nil {
		return report, err
	}

	report.UserEmail =
		stringPtrFromNull(userEmail)

	report.TargetType =
		stringPtrFromNull(targetType)

	report.TargetID =
		stringPtrFromNull(targetID)

	report.TargetURL =
		stringPtrFromNull(targetURL)

	return report, nil
}

func stringPtrFromNull(value sql.NullString) *string {
	if !value.Valid {
		return nil
	}

	return &value.String
}

func isAllowedReportStatus(status string) bool {
	switch status {
	case "open", "reviewing", "resolved", "rejected", "duplicate":
		return true
	default:
		return false
	}
}

func parseLimit(value string, fallback int, max int) int {
	limit, err :=
		strconv.Atoi(value)

	if err != nil || limit <= 0 {
		return fallback
	}

	if limit > max {
		return max
	}

	return limit
}
