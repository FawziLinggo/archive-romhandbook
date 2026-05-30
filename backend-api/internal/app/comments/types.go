package comments

import "errors"

var ErrCommentNotFound = errors.New("comment not found")

var ErrForbidden = errors.New("you cannot modify this comment")

var ErrReplyDepthLimit = errors.New("reply depth limit reached")

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

type CreateCommentRequest struct {
	TargetType string  `json:"target_type"`
	TargetID   string  `json:"target_id"`
	ParentID   *string `json:"parent_id"`
	Body       string  `json:"body"`
}

type UpdateCommentRequest struct {
	Body string `json:"body"`
}

type CreateCommentInput struct {
	ID         string
	UserID     string
	TargetType string
	TargetID   string
	ParentID   *string
	Body       string
}
