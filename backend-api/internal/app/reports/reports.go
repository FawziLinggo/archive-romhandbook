package reports

import (
	"database/sql"
	"net/http"
	"strings"

	"backend-api/internal/app/session"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type Handler struct {
	DB *sql.DB
}

type Report struct {
	ID         string  `json:"id"`
	UserID     string  `json:"user_id"`
	TargetType *string `json:"target_type"`
	TargetID   *string `json:"target_id"`
	TargetURL  *string `json:"target_url"`
	Title      string  `json:"title"`
	Body       string  `json:"body"`
	Status     string  `json:"status"`
	CreatedAt  string  `json:"created_at"`
	UpdatedAt  string  `json:"updated_at"`
}

type CreateReportRequest struct {
	TargetType *string `json:"target_type"`
	TargetID   *string `json:"target_id"`
	TargetURL  *string `json:"target_url"`
	Title      string  `json:"title"`
	Body       string  `json:"body"`
}

type UpdateReportRequest struct {
	TargetType *string `json:"target_type"`
	TargetID   *string `json:"target_id"`
	TargetURL  *string `json:"target_url"`
	Title      string  `json:"title"`
	Body       string  `json:"body"`
}

func NewHandler(
	db *sql.DB,
) *Handler {
	return &Handler{
		DB: db,
	}
}

func (handler *Handler) ListReports(c *gin.Context) {
	userID, ok :=
		session.RequireUserID(c, handler.DB)

	if !ok {
		return
	}

	rows, err :=
		handler.DB.Query(
			`
			SELECT
				id,
				user_id,
				target_type,
				target_id,
				target_url,
				title,
				body,
				status,
				created_at,
				updated_at
			FROM reports
			WHERE user_id = ?
			AND status != 'deleted'
			ORDER BY created_at DESC
			LIMIT 100
			`,
			userID,
		)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	defer rows.Close()

	items :=
		[]Report{}

	for rows.Next() {
		report, err :=
			scanReport(rows)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"message": err.Error(),
			})
			return
		}

		items = append(items, report)
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    items,
	})
}

func (handler *Handler) CreateReport(c *gin.Context) {
	userID, ok :=
		session.RequireUserID(c, handler.DB)

	if !ok {
		return
	}

	var request CreateReportRequest

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request body",
		})
		return
	}

	title :=
		strings.TrimSpace(request.Title)

	body :=
		strings.TrimSpace(request.Body)

	if title == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Title is required",
		})
		return
	}

	if body == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Description is required",
		})
		return
	}

	if len(title) > 120 {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Title is too long",
		})
		return
	}

	if len(body) > 2000 {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Description is too long",
		})
		return
	}

	id :=
		uuid.NewString()

	_, err :=
		handler.DB.Exec(
			`
			INSERT INTO reports (
				id,
				user_id,
				target_type,
				target_id,
				target_url,
				title,
				body,
				status
			)
			VALUES (?, ?, ?, ?, ?, ?, ?, 'open')
			`,
			id,
			userID,
			nullableTrim(request.TargetType),
			nullableTrim(request.TargetID),
			nullableTrim(request.TargetURL),
			title,
			body,
		)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	report, err :=
		handler.getUserReportByID(userID, id)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"data":    report,
	})
}

func (handler *Handler) GetReport(c *gin.Context) {
	userID, ok :=
		session.RequireUserID(c, handler.DB)

	if !ok {
		return
	}

	reportID :=
		c.Param("id")

	report, err :=
		handler.getUserReportByID(userID, reportID)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Report not found",
		})
		return
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    report,
	})
}

func (handler *Handler) UpdateReport(c *gin.Context) {
	userID, ok :=
		session.RequireUserID(c, handler.DB)

	if !ok {
		return
	}

	reportID :=
		c.Param("id")

	current, err :=
		handler.getUserReportByID(userID, reportID)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Report not found",
		})
		return
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	if current.Status != "open" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Only open reports can be edited",
		})
		return
	}

	var request UpdateReportRequest

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request body",
		})
		return
	}

	title :=
		strings.TrimSpace(request.Title)

	body :=
		strings.TrimSpace(request.Body)

	if title == "" || body == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Title and description are required",
		})
		return
	}

	_, err = handler.DB.Exec(
		`
		UPDATE reports
		SET
			target_type = ?,
			target_id = ?,
			target_url = ?,
			title = ?,
			body = ?,
			updated_at = CURRENT_TIMESTAMP
		WHERE id = ?
		AND user_id = ?
		AND status = 'open'
		`,
		nullableTrim(request.TargetType),
		nullableTrim(request.TargetID),
		nullableTrim(request.TargetURL),
		title,
		body,
		reportID,
		userID,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	report, err :=
		handler.getUserReportByID(userID, reportID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    report,
	})
}

func (handler *Handler) DeleteReport(c *gin.Context) {
	userID, ok :=
		session.RequireUserID(c, handler.DB)

	if !ok {
		return
	}

	reportID :=
		c.Param("id")

	_, err :=
		handler.DB.Exec(
			`
			UPDATE reports
			SET
				status = 'deleted',
				updated_at = CURRENT_TIMESTAMP
			WHERE id = ?
			AND user_id = ?
			AND status = 'open'
			`,
			reportID,
			userID,
		)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Report deleted",
	})
}

func (handler *Handler) getUserReportByID(
	userID string,
	reportID string,
) (
	Report,
	error,
) {
	row :=
		handler.DB.QueryRow(
			`
			SELECT
				id,
				user_id,
				target_type,
				target_id,
				target_url,
				title,
				body,
				status,
				created_at,
				updated_at
			FROM reports
			WHERE id = ?
			AND user_id = ?
			AND status != 'deleted'
			LIMIT 1
			`,
			reportID,
			userID,
		)

	return scanReport(row)
}

type scanner interface {
	Scan(dest ...any) error
}

func scanReport(
	row scanner,
) (
	Report,
	error,
) {
	var report Report

	var targetType sql.NullString
	var targetID sql.NullString
	var targetURL sql.NullString

	err :=
		row.Scan(
			&report.ID,
			&report.UserID,
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
		return Report{}, err
	}

	report.TargetType =
		stringPtrFromNull(targetType)

	report.TargetID =
		stringPtrFromNull(targetID)

	report.TargetURL =
		stringPtrFromNull(targetURL)

	return report, nil
}

func nullableTrim(
	value *string,
) sql.NullString {
	if value == nil {
		return sql.NullString{}
	}

	trimmed :=
		strings.TrimSpace(*value)

	if trimmed == "" {
		return sql.NullString{}
	}

	return sql.NullString{
		String: trimmed,
		Valid:  true,
	}
}

func stringPtrFromNull(
	value sql.NullString,
) *string {
	if !value.Valid {
		return nil
	}

	return &value.String
}
