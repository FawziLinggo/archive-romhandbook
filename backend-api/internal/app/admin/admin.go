package admin

import (
	"database/sql"
	"net/http"

	"backend-api/internal/app/session"

	"github.com/gin-gonic/gin"
)

func RequireAdmin(c *gin.Context, db *sql.DB) (string, bool) {
	userID, ok := session.RequireUserID(c, db)

	if !ok {
		return "", false
	}

	var role string

	err := db.QueryRow(`
		SELECT role
		FROM users
		WHERE id = ?
		AND status = 'active'
		LIMIT 1
	`, userID).Scan(&role)

	if err != nil || role != "admin" {
		c.JSON(
			http.StatusForbidden,
			gin.H{
				"success": false,
				"message": "Admin access required",
			},
		)

		return "", false
	}

	return userID, true
}
