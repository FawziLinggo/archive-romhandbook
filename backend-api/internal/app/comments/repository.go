package comments

import (
	"database/sql"
	"strings"
)

type Repository struct {
	DB *sql.DB
}

func NewRepository(db *sql.DB) *Repository {
	return &Repository{
		DB: db,
	}
}

func (repository *Repository) ListByTarget(targetType string, targetID string) ([]Comment, error) {
	rows, err :=
		repository.DB.Query(`
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
		return nil, err
	}

	defer rows.Close()

	items :=
		[]Comment{}

	for rows.Next() {
		comment, err :=
			scanComment(rows)

		if err != nil {
			return nil, err
		}

		items =
			append(items, comment)
	}

	return items, nil
}

func (repository *Repository) FindByID(commentID string) (Comment, error) {
	row :=
		repository.DB.QueryRow(`
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

func (repository *Repository) Create(input CreateCommentInput) error {
	_, err :=
		repository.DB.Exec(`
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
			input.ID,
			input.UserID,
			input.TargetType,
			input.TargetID,
			nullableTrim(input.ParentID),
			input.Body,
		)

	return err
}

func (repository *Repository) UpdateBody(commentID string, body string) error {
	_, err :=
		repository.DB.Exec(`
			UPDATE comments
			SET
				body = ?,
				updated_at = CURRENT_TIMESTAMP
			WHERE id = ?
			AND status = 'visible'
			AND deleted_at IS NULL
		`, body, commentID)

	return err
}

func (repository *Repository) SoftDelete(commentID string) error {
	_, err :=
		repository.DB.Exec(`
			UPDATE comments
			SET
				status = 'deleted',
				deleted_at = CURRENT_TIMESTAMP,
				updated_at = CURRENT_TIMESTAMP
			WHERE id = ?
			AND status = 'visible'
			AND deleted_at IS NULL
		`, commentID)

	return err
}

func (repository *Repository) GetUserRole(userID string) (string, error) {
	var role string

	err :=
		repository.DB.QueryRow(`
			SELECT role
			FROM users
			WHERE id = ?
			AND status = 'active'
			LIMIT 1
		`, userID).Scan(&role)

	return role, err
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
		return Comment{}, err
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

func nullableTrim(value *string) sql.NullString {
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

func stringPtrFromNull(value sql.NullString) *string {
	if !value.Valid {
		return nil
	}

	return &value.String
}
