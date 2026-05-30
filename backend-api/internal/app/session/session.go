package session

import (
	"crypto/sha256"
	"database/sql"
	"encoding/hex"
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
)

const CookieName = "rom_session"

var ErrMissingSession = errors.New("missing session")

func LookupUserID(
	c *gin.Context,
	db *sql.DB,
) (
	string,
	error,
) {
	sessionToken, err :=
		c.Cookie(CookieName)

	if err != nil || sessionToken == "" {
		return "", ErrMissingSession
	}

	var userID string

	err = db.QueryRow(
		`
		SELECT u.id
		FROM user_sessions s
		JOIN users u
			ON u.id = s.user_id
		WHERE s.session_token_hash = ?
		AND s.revoked_at IS NULL
		AND s.expires_at > CURRENT_TIMESTAMP
		AND u.status = 'active'
		LIMIT 1
		`,
		hashToken(sessionToken),
	).Scan(&userID)

	if err != nil {
		return "", err
	}

	return userID, nil
}

func RequireUserID(
	c *gin.Context,
	db *sql.DB,
) (
	string,
	bool,
) {
	userID, err :=
		LookupUserID(c, db)

	if errors.Is(err, ErrMissingSession) {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "Unauthenticated",
		})
		return "", false
	}

	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "Invalid session",
		})
		return "", false
	}

	return userID, true
}

func hashToken(
	token string,
) string {
	sum :=
		sha256.Sum256([]byte(token))

	return hex.EncodeToString(sum[:])
}
