package auth

import (
	"crypto/rand"
	"crypto/sha256"
	"database/sql"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"errors"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

const (
	sessionCookieName = "rom_session"
	stateCookieName   = "rom_oauth_state"
)

type Config struct {
	FrontendURL  string
	ClientID     string
	ClientSecret string
	RedirectURL  string
}

type Handler struct {
	DB         *sql.DB
	Config     Config
	HTTPClient *http.Client
}

type DiscordUser struct {
	ID         string `json:"id"`
	Username   string `json:"username"`
	GlobalName string `json:"global_name"`
	Avatar     string `json:"avatar"`
	Email      string `json:"email"`
}

type MeResponse struct {
	ID               string  `json:"id"`
	Email            *string `json:"email"`
	DisplayName      string  `json:"display_name"`
	AvatarURL        *string `json:"avatar_url"`
	Provider         string  `json:"provider"`
	ProviderUserID   string  `json:"provider_user_id"`
	Role             string  `json:"role"`
	Status           string  `json:"status"`
	ClassName        *string `json:"class_name"`
	RankName         string  `json:"rank_name"`
	PointsTotal      int     `json:"points_total"`
	NextRankName     *string `json:"next_rank_name"`
	NextRankPoints   *int    `json:"next_rank_points"`
	PointsToNextRank int     `json:"points_to_next_rank"`
}

func NewHandler(
	db *sql.DB,
	config Config,
) *Handler {
	return &Handler{
		DB:     db,
		Config: config,
		HTTPClient: &http.Client{
			Timeout: 12 * time.Second,
		},
	}
}

func (handler *Handler) DiscordLogin(c *gin.Context) {
	if handler.Config.ClientID == "" || handler.Config.RedirectURL == "" {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Discord auth is not configured",
		})
		return
	}

	state, err :=
		randomToken(24)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to create OAuth state",
		})
		return
	}

	setCookie(
		c,
		stateCookieName,
		state,
		10*60,
	)

	params :=
		url.Values{}

	params.Set("client_id", handler.Config.ClientID)
	params.Set("redirect_uri", handler.Config.RedirectURL)
	params.Set("response_type", "code")
	params.Set("scope", "identify email")
	params.Set("state", state)

	authorizeURL :=
		"https://discord.com/oauth2/authorize?" + params.Encode()

	c.Redirect(
		http.StatusFound,
		authorizeURL,
	)
}

func (handler *Handler) DiscordCallback(c *gin.Context) {
	code :=
		c.Query("code")

	state :=
		c.Query("state")

	if code == "" || state == "" {
		redirectWithError(c, handler.Config.FrontendURL, "missing_oauth_code")
		return
	}

	stateCookie, err :=
		c.Cookie(stateCookieName)

	if err != nil || stateCookie == "" || stateCookie != state {
		redirectWithError(c, handler.Config.FrontendURL, "invalid_oauth_state")
		return
	}

	deleteCookie(c, stateCookieName)

	accessToken, err :=
		handler.exchangeCode(code)

	if err != nil {
		redirectWithError(c, handler.Config.FrontendURL, "discord_token_failed")
		return
	}

	discordUser, err :=
		handler.fetchDiscordUser(accessToken)

	if err != nil {
		redirectWithError(c, handler.Config.FrontendURL, "discord_user_failed")
		return
	}

	userID, err :=
		handler.upsertDiscordUser(discordUser)

	if err != nil {
		redirectWithError(c, handler.Config.FrontendURL, "user_save_failed")
		return
	}

	sessionToken, err :=
		randomToken(32)

	if err != nil {
		redirectWithError(c, handler.Config.FrontendURL, "session_failed")
		return
	}

	err = handler.createSession(
		userID,
		hashToken(sessionToken),
		c.Request.UserAgent(),
		c.ClientIP(),
		time.Now().Add(30*24*time.Hour),
	)

	if err != nil {
		redirectWithError(c, handler.Config.FrontendURL, "session_save_failed")
		return
	}

	setCookie(
		c,
		sessionCookieName,
		sessionToken,
		30*24*60*60,
	)

	redirectURL :=
		strings.TrimRight(handler.Config.FrontendURL, "/") + "/auth/callback?success=1"

	c.Redirect(
		http.StatusFound,
		redirectURL,
	)
}

func (handler *Handler) Me(c *gin.Context) {
	sessionToken, err :=
		c.Cookie(sessionCookieName)

	if err != nil || sessionToken == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "Unauthenticated",
		})
		return
	}

	user, err :=
		handler.getUserBySessionHash(
			hashToken(sessionToken),
		)

	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "Invalid session",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    user,
	})
}

func (handler *Handler) Logout(c *gin.Context) {
	sessionToken, err :=
		c.Cookie(sessionCookieName)

	if err == nil && sessionToken != "" {
		_ = handler.revokeSession(
			hashToken(sessionToken),
		)
	}

	deleteCookie(c, sessionCookieName)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Logged out",
	})
}

func (handler *Handler) exchangeCode(
	code string,
) (
	string,
	error,
) {
	form :=
		url.Values{}

	form.Set("client_id", handler.Config.ClientID)
	form.Set("client_secret", handler.Config.ClientSecret)
	form.Set("grant_type", "authorization_code")
	form.Set("code", code)
	form.Set("redirect_uri", handler.Config.RedirectURL)

	req, err :=
		http.NewRequest(
			http.MethodPost,
			"https://discord.com/api/v10/oauth2/token",
			strings.NewReader(form.Encode()),
		)

	if err != nil {
		return "", err
	}

	req.Header.Set(
		"Content-Type",
		"application/x-www-form-urlencoded",
	)

	res, err :=
		handler.HTTPClient.Do(req)

	if err != nil {
		return "", err
	}

	defer res.Body.Close()

	if res.StatusCode < 200 || res.StatusCode >= 300 {
		return "", errors.New("discord token exchange failed")
	}

	var payload struct {
		AccessToken string `json:"access_token"`
	}

	err = json.NewDecoder(res.Body).Decode(&payload)

	if err != nil {
		return "", err
	}

	if payload.AccessToken == "" {
		return "", errors.New("missing access token")
	}

	return payload.AccessToken, nil
}

func (handler *Handler) fetchDiscordUser(
	accessToken string,
) (
	DiscordUser,
	error,
) {
	req, err :=
		http.NewRequest(
			http.MethodGet,
			"https://discord.com/api/v10/users/@me",
			nil,
		)

	if err != nil {
		return DiscordUser{}, err
	}

	req.Header.Set(
		"Authorization",
		"Bearer "+accessToken,
	)

	res, err :=
		handler.HTTPClient.Do(req)

	if err != nil {
		return DiscordUser{}, err
	}

	defer res.Body.Close()

	if res.StatusCode < 200 || res.StatusCode >= 300 {
		return DiscordUser{}, errors.New("discord user request failed")
	}

	var user DiscordUser

	err = json.NewDecoder(res.Body).Decode(&user)

	if err != nil {
		return DiscordUser{}, err
	}

	if user.ID == "" {
		return DiscordUser{}, errors.New("missing discord user id")
	}

	return user, nil
}

func (handler *Handler) upsertDiscordUser(
	discordUser DiscordUser,
) (
	string,
	error,
) {
	tx, err :=
		handler.DB.Begin()

	if err != nil {
		return "", err
	}

	defer tx.Rollback()

	var userID string

	err = tx.QueryRow(
		`
		SELECT id
		FROM users
		WHERE provider = ?
		AND provider_user_id = ?
		LIMIT 1
		`,
		"discord",
		discordUser.ID,
	).Scan(&userID)

	displayName :=
		discordUser.GlobalName

	if displayName == "" {
		displayName = discordUser.Username
	}

	avatarURL :=
		buildDiscordAvatarURL(
			discordUser.ID,
			discordUser.Avatar,
		)

	emailValue :=
		nullString(discordUser.Email)

	avatarValue :=
		nullString(avatarURL)

	if err == sql.ErrNoRows {
		userID =
			uuid.NewString()

		_, err = tx.Exec(
			`
			INSERT INTO users (
				id,
				email,
				display_name,
				avatar_url,
				provider,
				provider_user_id
			)
			VALUES (?, ?, ?, ?, ?, ?)
			`,
			userID,
			emailValue,
			displayName,
			avatarValue,
			"discord",
			discordUser.ID,
		)

		if err != nil {
			return "", err
		}
	} else if err != nil {
		return "", err
	} else {
		_, err = tx.Exec(
			`
			UPDATE users
			SET
				email = ?,
				avatar_url = ?,
				updated_at = CURRENT_TIMESTAMP
			WHERE id = ?
			`,
			emailValue,
			avatarValue,
			userID,
		)

		if err != nil {
			return "", err
		}
	}

	_, err = tx.Exec(
		`
		INSERT OR IGNORE INTO user_profiles (
			user_id
		)
		VALUES (?)
		`,
		userID,
	)

	if err != nil {
		return "", err
	}

	err = tx.Commit()

	if err != nil {
		return "", err
	}

	return userID, nil
}

func (handler *Handler) createSession(
	userID string,
	sessionTokenHash string,
	userAgent string,
	ipAddress string,
	expiresAt time.Time,
) error {
	_, err :=
		handler.DB.Exec(
			`
			INSERT INTO user_sessions (
				id,
				user_id,
				session_token_hash,
				user_agent,
				ip_address,
				expires_at
			)
			VALUES (?, ?, ?, ?, ?, ?)
			`,
			uuid.NewString(),
			userID,
			sessionTokenHash,
			userAgent,
			ipAddress,
			expiresAt.UTC(),
		)

	return err
}

func (handler *Handler) attachRankProgress(user *MeResponse) {
	var nextRankName string
	var nextRankPoints int

	err :=
		handler.DB.QueryRow(
			`
			SELECT
				rank_name,
				min_points
			FROM rank_rules
			WHERE min_points > ?
			ORDER BY min_points ASC
			LIMIT 1
			`,
			user.PointsTotal,
		).Scan(
			&nextRankName,
			&nextRankPoints,
		)

	if err != nil {
		user.NextRankName = nil
		user.NextRankPoints = nil
		user.PointsToNextRank = 0
		return
	}

	user.NextRankName =
		&nextRankName

	user.NextRankPoints =
		&nextRankPoints

	user.PointsToNextRank =
		nextRankPoints - user.PointsTotal
}

func (handler *Handler) getUserBySessionHash(
	sessionTokenHash string,
) (
	MeResponse,
	error,
) {
	var user MeResponse

	var email sql.NullString
	var avatarURL sql.NullString
	var className sql.NullString

	err :=
		handler.DB.QueryRow(
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
				p.class_name,
				p.rank_name,
				p.points_total
			FROM user_sessions s
			JOIN users u
				ON u.id = s.user_id
			LEFT JOIN user_profiles p
				ON p.user_id = u.id
			WHERE s.session_token_hash = ?
			AND s.revoked_at IS NULL
			AND s.expires_at > CURRENT_TIMESTAMP
			AND u.status = 'active'
			LIMIT 1
			`,
			sessionTokenHash,
		).Scan(
			&user.ID,
			&email,
			&user.DisplayName,
			&avatarURL,
			&user.Provider,
			&user.ProviderUserID,
			&user.Role,
			&user.Status,
			&className,
			&user.RankName,
			&user.PointsTotal,
		)

	if err != nil {
		return MeResponse{}, err
	}

	user.Email =
		stringPtrFromNull(email)

	user.AvatarURL =
		stringPtrFromNull(avatarURL)

	user.ClassName =
		stringPtrFromNull(className)

	handler.attachRankProgress(&user)

	_, _ = handler.DB.Exec(
		`
		UPDATE user_sessions
		SET last_seen_at = CURRENT_TIMESTAMP
		WHERE session_token_hash = ?
		`,
		sessionTokenHash,
	)

	return user, nil
}

func (handler *Handler) revokeSession(
	sessionTokenHash string,
) error {
	_, err :=
		handler.DB.Exec(
			`
			UPDATE user_sessions
			SET revoked_at = CURRENT_TIMESTAMP
			WHERE session_token_hash = ?
			`,
			sessionTokenHash,
		)

	return err
}

func randomToken(
	byteLength int,
) (
	string,
	error,
) {
	buffer :=
		make([]byte, byteLength)

	_, err :=
		rand.Read(buffer)

	if err != nil {
		return "", err
	}

	return base64.RawURLEncoding.EncodeToString(buffer), nil
}

func hashToken(
	token string,
) string {
	sum :=
		sha256.Sum256([]byte(token))

	return hex.EncodeToString(sum[:])
}

func setCookie(
	c *gin.Context,
	name string,
	value string,
	maxAge int,
) {
	http.SetCookie(
		c.Writer,
		&http.Cookie{
			Name:     name,
			Value:    value,
			Path:     "/",
			MaxAge:   maxAge,
			HttpOnly: true,
			SameSite: http.SameSiteLaxMode,
		},
	)
}

func deleteCookie(
	c *gin.Context,
	name string,
) {
	http.SetCookie(
		c.Writer,
		&http.Cookie{
			Name:     name,
			Value:    "",
			Path:     "/",
			MaxAge:   -1,
			HttpOnly: true,
			SameSite: http.SameSiteLaxMode,
		},
	)
}

func redirectWithError(
	c *gin.Context,
	frontendURL string,
	code string,
) {
	redirectURL :=
		strings.TrimRight(frontendURL, "/") + "/auth/callback?error=" + url.QueryEscape(code)

	c.Redirect(
		http.StatusFound,
		redirectURL,
	)
}

func buildDiscordAvatarURL(
	userID string,
	avatarHash string,
) string {
	if userID == "" || avatarHash == "" {
		return ""
	}

	extension :=
		"png"

	if strings.HasPrefix(avatarHash, "a_") {
		extension = "gif"
	}

	return "https://cdn.discordapp.com/avatars/" + userID + "/" + avatarHash + "." + extension + "?size=128"
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
