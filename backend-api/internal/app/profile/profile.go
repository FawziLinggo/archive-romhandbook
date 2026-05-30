package profile

import (
	"crypto/sha256"
	"database/sql"
	"encoding/hex"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

const sessionCookieName = "rom_session"

type Handler struct {
	AppDB     *sql.DB
	ArchiveDB *sql.DB
}

type ProfileResponse struct {
	ID             string  `json:"id"`
	Email          *string `json:"email"`
	DisplayName    string  `json:"display_name"`
	AvatarURL      *string `json:"avatar_url"`
	Provider       string  `json:"provider"`
	ProviderUserID string  `json:"provider_user_id"`
	Role           string  `json:"role"`
	Status         string  `json:"status"`
	ClassID        *string `json:"class_id"`
	ClassName      *string `json:"class_name"`
	ClassImage     *string `json:"class_image"`
	RankName       string  `json:"rank_name"`
	PointsTotal    int     `json:"points_total"`
	Bio            *string `json:"bio"`
}

type UpdateProfileRequest struct {
	DisplayName string  `json:"display_name"`
	ClassID     *string `json:"class_id"`
	Bio         *string `json:"bio"`
}

type JobClass struct {
	ID    string
	Name  string
	Image sql.NullString
}

func NewHandler(
	appDB *sql.DB,
	archiveDB *sql.DB,
) *Handler {
	return &Handler{
		AppDB:     appDB,
		ArchiveDB: archiveDB,
	}
}

func (handler *Handler) GetProfile(c *gin.Context) {
	userID, ok :=
		handler.requireUserID(c)

	if !ok {
		return
	}

	profile, err :=
		handler.getProfileByUserID(userID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    profile,
	})
}

func (handler *Handler) UpdateProfile(c *gin.Context) {
	userID, ok :=
		handler.requireUserID(c)

	if !ok {
		return
	}

	var request UpdateProfileRequest

	err :=
		c.ShouldBindJSON(&request)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request body",
		})
		return
	}

	displayName :=
		strings.TrimSpace(request.DisplayName)

	if displayName == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Display name is required",
		})
		return
	}

	if len(displayName) > 32 {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Display name is too long",
		})
		return
	}

	bio :=
		""

	if request.Bio != nil {
		bio =
			strings.TrimSpace(*request.Bio)
	}

	if len(bio) > 240 {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Bio is too long",
		})
		return
	}

	var classID sql.NullString
	var className sql.NullString
	var classImage sql.NullString

	if request.ClassID != nil && strings.TrimSpace(*request.ClassID) != "" {
		jobClass, err :=
			handler.getJobClassByID(
				strings.TrimSpace(*request.ClassID),
			)

		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"message": "Selected class was not found",
			})
			return
		}

		classID = sql.NullString{
			String: jobClass.ID,
			Valid:  true,
		}

		className = sql.NullString{
			String: jobClass.Name,
			Valid:  true,
		}

		classImage = jobClass.Image
	}

	tx, err :=
		handler.AppDB.Begin()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	defer tx.Rollback()

	_, err = tx.Exec(
		`
		UPDATE users
		SET
			display_name = ?,
			updated_at = CURRENT_TIMESTAMP
		WHERE id = ?
		`,
		displayName,
		userID,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	_, err = tx.Exec(
		`
		UPDATE user_profiles
		SET
			class_id = ?,
			class_name = ?,
			class_image = ?,
			bio = ?,
			updated_at = CURRENT_TIMESTAMP
		WHERE user_id = ?
		`,
		classID,
		className,
		classImage,
		nullString(bio),
		userID,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	err = tx.Commit()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	profile, err :=
		handler.getProfileByUserID(userID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    profile,
	})
}

func (handler *Handler) requireUserID(c *gin.Context) (
	string,
	bool,
) {
	sessionToken, err :=
		c.Cookie(sessionCookieName)

	if err != nil || sessionToken == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "Unauthenticated",
		})
		return "", false
	}

	var userID string

	err = handler.AppDB.QueryRow(
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
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "Invalid session",
		})
		return "", false
	}

	return userID, true
}

func (handler *Handler) getProfileByUserID(
	userID string,
) (
	ProfileResponse,
	error,
) {
	var profile ProfileResponse

	var email sql.NullString
	var avatarURL sql.NullString
	var classID sql.NullString
	var className sql.NullString
	var classImage sql.NullString
	var bio sql.NullString

	err :=
		handler.AppDB.QueryRow(
			`
			SELECT
				u.id,
				u.email,
				u.display_name,
				u.avatar_url,
				u.provider,
				u.provider_user_id,
				u.role,
				u.status,
				p.class_id,
				p.class_name,
				p.class_image,
				p.rank_name,
				p.points_total,
				p.bio
			FROM users u
			LEFT JOIN user_profiles p
				ON p.user_id = u.id
			WHERE u.id = ?
			LIMIT 1
			`,
			userID,
		).Scan(
			&profile.ID,
			&email,
			&profile.DisplayName,
			&avatarURL,
			&profile.Provider,
			&profile.ProviderUserID,
			&profile.Role,
			&profile.Status,
			&classID,
			&className,
			&classImage,
			&profile.RankName,
			&profile.PointsTotal,
			&bio,
		)

	if err != nil {
		return ProfileResponse{}, err
	}

	profile.Email =
		stringPtrFromNull(email)

	profile.AvatarURL =
		stringPtrFromNull(avatarURL)

	profile.ClassID =
		stringPtrFromNull(classID)

	profile.ClassName =
		stringPtrFromNull(className)

	profile.ClassImage =
		stringPtrFromNull(classImage)

	profile.Bio =
		stringPtrFromNull(bio)

	return profile, nil
}

func (handler *Handler) getJobClassByID(
	classID string,
) (
	JobClass,
	error,
) {
	var jobClass JobClass

	err :=
		handler.ArchiveDB.QueryRow(
			`
			SELECT
				id,
				name,
				image
			FROM jobs
			WHERE id = ?
			LIMIT 1
			`,
			classID,
		).Scan(
			&jobClass.ID,
			&jobClass.Name,
			&jobClass.Image,
		)

	if err != nil {
		return JobClass{}, err
	}

	return jobClass, nil
}

func hashToken(
	token string,
) string {
	sum :=
		sha256.Sum256([]byte(token))

	return hex.EncodeToString(sum[:])
}

func nullString(
	value string,
) sql.NullString {
	if value == "" {
		return sql.NullString{}
	}

	return sql.NullString{
		String: value,
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
