package comments

import (
	"crypto/rand"
	"database/sql"
	"encoding/hex"
	"net/http"
	"strings"

	"backend-api/internal/app/session"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	DB *sql.DB
}

type CommentAuthor struct {
	ID          string  `json:"id"`
	DisplayName string  `json:"display_name"`
	AvatarURL   *string `json:"avatar_url"`
	RankName    string  `json:"rank_name"`
	PointsTotal int     `json:"points_total"`
	ClassName   *string `json:"class_name"`
	ClassImage  *string `json:"class_image"`
}

type Comment struct {
	ID         string        `json:"id"`
	UserID     string        `json:"user_id"`
	TargetType string        `json:"target_type"`
	TargetID   string        `json:"target_id"`
	ParentID   *string       `json:"parent_id"`
	Body       string        `json:"body"`
	Status     string        `json:"status"`
	Depth      int           `json:"depth"`
	CreatedAt  string        `json:"created_at"`
	UpdatedAt  string        `json:"updated_at"`
	Author     CommentAuthor `json:"author"`
	Replies    []Comment     `json:"replies"`
}

type CommentRow struct {
	Comment
}

type CreateCommentRequest struct {
	TargetType string  `json:"target_type"`
	TargetID   string  `json:"target_id"`
	ParentID   *string `json:"parent_id"`
	Body       string  `json:"body"`
}

type UpdateCommentRequest struct {
	Body string `json:"body"`
}

func NewHandler(db *sql.DB) *Handler {
	return &Handler{
		DB: db,
	}
}

func (h *Handler) ListComments(c *gin.Context) {
	targetType :=
		strings.TrimSpace(c.Query("target_type"))

	targetID :=
		strings.TrimSpace(c.Query("target_id"))

	if targetType == "" || targetID == "" {
		c.JSON(
			http.StatusBadRequest,
			gin.H{
				"success": false,
				"message": "target_type and target_id are required",
			},
		)

		return
	}

	rows, err :=
		h.DB.Query(`
			SELECT
				c.id,
				c.user_id,
				c.target_type,
				c.target_id,
				c.parent_id,
				c.body,
				c.status,
				c.created_at,
				c.updated_at,
				COALESCE(u.display_name, 'Unknown User') AS author_name,
				u.avatar_url,
				COALESCE(up.rank_name, 'Novice') AS rank_name,
				COALESCE(up.points_total, 0) AS points_total,
				up.class_name,
				up.class_image
			FROM comments c
			JOIN users u
				ON u.id = c.user_id
			LEFT JOIN user_profiles up
				ON up.user_id = u.id
			WHERE c.target_type = ?
			AND c.target_id = ?
			AND c.status = 'visible'
			AND c.deleted_at IS NULL
			ORDER BY c.created_at ASC
		`, targetType, targetID)

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

	flatComments :=
		[]Comment{}

	for rows.Next() {
		comment, err :=
			scanComment(rows)

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

		flatComments =
			append(flatComments, comment)
	}

	nestedComments :=
		buildNestedComments(flatComments)

	c.JSON(
		http.StatusOK,
		gin.H{
			"success": true,
			"data":    nestedComments,
			"meta": gin.H{
				"total": len(flatComments),
			},
		},
	)
}

func (h *Handler) CreateComment(c *gin.Context) {
	userID, ok :=
		session.RequireUserID(c, h.DB)

	if !ok {
		return
	}

	var request CreateCommentRequest

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

	targetType :=
		strings.TrimSpace(request.TargetType)

	targetID :=
		strings.TrimSpace(request.TargetID)

	body :=
		strings.TrimSpace(request.Body)

	if targetType == "" || targetID == "" {
		c.JSON(
			http.StatusBadRequest,
			gin.H{
				"success": false,
				"message": "target_type and target_id are required",
			},
		)

		return
	}

	if body == "" {
		c.JSON(
			http.StatusBadRequest,
			gin.H{
				"success": false,
				"message": "Comment body is required",
			},
		)

		return
	}

	if len(body) > 2000 {
		c.JSON(
			http.StatusBadRequest,
			gin.H{
				"success": false,
				"message": "Comment body is too long",
			},
		)

		return
	}

	parentID :=
		nullableTrim(request.ParentID)

	depth :=
		0

	if parentID != nil {
		parentDepth, err :=
			h.getParentDepth(*parentID, targetType, targetID)

		if err == sql.ErrNoRows {
			c.JSON(
				http.StatusBadRequest,
				gin.H{
					"success": false,
					"message": "Parent comment not found",
				},
			)

			return
		}

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

		depth =
			parentDepth + 1

		if depth > 2 {
			c.JSON(
				http.StatusBadRequest,
				gin.H{
					"success": false,
					"message": "Reply depth limit reached",
				},
			)

			return
		}
	}

	commentID, err :=
		randomID()

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

	_, err =
		h.DB.Exec(`
			INSERT INTO comments (
				id,
				user_id,
				target_type,
				target_id,
				parent_id,
				body,
				status
			)
			VALUES (?, ?, ?, ?, ?, ?, 'visible')
		`,
			commentID,
			userID,
			targetType,
			targetID,
			parentID,
			body,
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

	comment, err :=
		h.getCommentByID(commentID)

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

	comment.Depth =
		depth

	c.JSON(
		http.StatusCreated,
		gin.H{
			"success": true,
			"data":    comment,
		},
	)
}

func (h *Handler) UpdateComment(c *gin.Context) {
	userID, ok :=
		session.RequireUserID(c, h.DB)

	if !ok {
		return
	}

	commentID :=
		strings.TrimSpace(c.Param("id"))

	var request UpdateCommentRequest

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

	body :=
		strings.TrimSpace(request.Body)

	if body == "" {
		c.JSON(
			http.StatusBadRequest,
			gin.H{
				"success": false,
				"message": "Comment body is required",
			},
		)

		return
	}

	if len(body) > 2000 {
		c.JSON(
			http.StatusBadRequest,
			gin.H{
				"success": false,
				"message": "Comment body is too long",
			},
		)

		return
	}

	canModify, err :=
		h.canModifyComment(commentID, userID)

	if err == sql.ErrNoRows {
		c.JSON(
			http.StatusNotFound,
			gin.H{
				"success": false,
				"message": "Comment not found",
			},
		)

		return
	}

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

	if !canModify {
		c.JSON(
			http.StatusForbidden,
			gin.H{
				"success": false,
				"message": "You cannot edit this comment",
			},
		)

		return
	}

	_, err =
		h.DB.Exec(`
			UPDATE comments
			SET
				body = ?,
				updated_at = CURRENT_TIMESTAMP
			WHERE id = ?
			AND status = 'visible'
			AND deleted_at IS NULL
		`, body, commentID)

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

	comment, err :=
		h.getCommentByID(commentID)

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
			"data":    comment,
		},
	)
}

func (h *Handler) DeleteComment(c *gin.Context) {
	userID, ok :=
		session.RequireUserID(c, h.DB)

	if !ok {
		return
	}

	commentID :=
		strings.TrimSpace(c.Param("id"))

	canModify, err :=
		h.canModifyComment(commentID, userID)

	if err == sql.ErrNoRows {
		c.JSON(
			http.StatusNotFound,
			gin.H{
				"success": false,
				"message": "Comment not found",
			},
		)

		return
	}

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

	if !canModify {
		c.JSON(
			http.StatusForbidden,
			gin.H{
				"success": false,
				"message": "You cannot delete this comment",
			},
		)

		return
	}

	_, err =
		h.DB.Exec(`
			UPDATE comments
			SET
				status = 'deleted',
				deleted_at = CURRENT_TIMESTAMP,
				updated_at = CURRENT_TIMESTAMP
			WHERE id = ?
			AND status = 'visible'
			AND deleted_at IS NULL
		`, commentID)

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
			"data": gin.H{
				"id": commentID,
			},
		},
	)
}

func (h *Handler) getParentDepth(parentID string, targetType string, targetID string) (int, error) {
	var parentParentID sql.NullString

	err :=
		h.DB.QueryRow(`
			SELECT parent_id
			FROM comments
			WHERE id = ?
			AND target_type = ?
			AND target_id = ?
			AND status = 'visible'
			AND deleted_at IS NULL
			LIMIT 1
		`, parentID, targetType, targetID).Scan(&parentParentID)

	if err != nil {
		return 0, err
	}

	if !parentParentID.Valid {
		return 0, nil
	}

	var grandParentParentID sql.NullString

	err =
		h.DB.QueryRow(`
			SELECT parent_id
			FROM comments
			WHERE id = ?
			AND status = 'visible'
			AND deleted_at IS NULL
			LIMIT 1
		`, parentParentID.String).Scan(&grandParentParentID)

	if err != nil {
		return 0, err
	}

	if !grandParentParentID.Valid {
		return 1, nil
	}

	return 2, nil
}

func (h *Handler) canModifyComment(commentID string, userID string) (bool, error) {
	var ownerID string
	var role string

	err :=
		h.DB.QueryRow(`
			SELECT
				c.user_id,
				u.role
			FROM comments c
			JOIN users u
				ON u.id = ?
			WHERE c.id = ?
			AND c.status = 'visible'
			AND c.deleted_at IS NULL
			LIMIT 1
		`, userID, commentID).Scan(&ownerID, &role)

	if err != nil {
		return false, err
	}

	return ownerID == userID || role == "admin", nil
}

func (h *Handler) getCommentByID(commentID string) (Comment, error) {
	row :=
		h.DB.QueryRow(`
			SELECT
				c.id,
				c.user_id,
				c.target_type,
				c.target_id,
				c.parent_id,
				c.body,
				c.status,
				c.created_at,
				c.updated_at,
				COALESCE(u.display_name, 'Unknown User') AS author_name,
				u.avatar_url,
				COALESCE(up.rank_name, 'Novice') AS rank_name,
				COALESCE(up.points_total, 0) AS points_total,
				up.class_name,
				up.class_image
			FROM comments c
			JOIN users u
				ON u.id = c.user_id
			LEFT JOIN user_profiles up
				ON up.user_id = u.id
			WHERE c.id = ?
			AND c.status = 'visible'
			AND c.deleted_at IS NULL
			LIMIT 1
		`, commentID)

	return scanComment(row)
}

type commentScanner interface {
	Scan(dest ...any) error
}

func scanComment(scanner commentScanner) (Comment, error) {
	var comment Comment

	var parentID sql.NullString
	var avatarURL sql.NullString
	var className sql.NullString
	var classImage sql.NullString

	err :=
		scanner.Scan(
			&comment.ID,
			&comment.UserID,
			&comment.TargetType,
			&comment.TargetID,
			&parentID,
			&comment.Body,
			&comment.Status,
			&comment.CreatedAt,
			&comment.UpdatedAt,
			&comment.Author.DisplayName,
			&avatarURL,
			&comment.Author.RankName,
			&comment.Author.PointsTotal,
			&className,
			&classImage,
		)

	if err != nil {
		return comment, err
	}

	comment.ParentID =
		stringPtrFromNull(parentID)

	comment.Author.ID =
		comment.UserID

	comment.Author.AvatarURL =
		stringPtrFromNull(avatarURL)

	comment.Author.ClassName =
		stringPtrFromNull(className)

	comment.Author.ClassImage =
		stringPtrFromNull(classImage)

	comment.Replies =
		[]Comment{}

	return comment, nil
}

func buildNestedComments(flatComments []Comment) []Comment {
	byID :=
		map[string]*Comment{}

	childrenByParentID :=
		map[string][]*Comment{}

	for i := range flatComments {
		flatComments[i].Replies =
			[]Comment{}

		byID[flatComments[i].ID] =
			&flatComments[i]
	}

	for i := range flatComments {
		comment :=
			&flatComments[i]

		if comment.ParentID == nil {
			continue
		}

		parentID :=
			*comment.ParentID

		if _, exists := byID[parentID]; !exists {
			continue
		}

		childrenByParentID[parentID] =
			append(
				childrenByParentID[parentID],
				comment,
			)
	}

	var attachReplies func(comment *Comment, depth int) Comment

	attachReplies = func(comment *Comment, depth int) Comment {
		result :=
			*comment

		result.Depth =
			depth

		result.Replies =
			[]Comment{}

		children :=
			childrenByParentID[comment.ID]

		for _, child := range children {
			result.Replies =
				append(
					result.Replies,
					attachReplies(
						child,
						depth+1,
					),
				)
		}

		return result
	}

	roots :=
		[]Comment{}

	for i := range flatComments {
		comment :=
			&flatComments[i]

		if comment.ParentID != nil {
			continue
		}

		roots =
			append(
				roots,
				attachReplies(
					comment,
					0,
				),
			)
	}

	return roots
}

func nullableTrim(value *string) *string {
	if value == nil {
		return nil
	}

	trimmed :=
		strings.TrimSpace(*value)

	if trimmed == "" {
		return nil
	}

	return &trimmed
}

func stringPtrFromNull(value sql.NullString) *string {
	if !value.Valid {
		return nil
	}

	return &value.String
}

func randomID() (string, error) {
	bytes :=
		make([]byte, 16)

	_, err :=
		rand.Read(bytes)

	if err != nil {
		return "", err
	}

	return hex.EncodeToString(bytes), nil
}
