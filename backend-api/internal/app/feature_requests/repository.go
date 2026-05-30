package feature_requests

import (
	"database/sql"
	"strings"
)

type Repository struct {
	DB *sql.DB
}

func NewRepository(db *sql.DB) *Repository {
	return &Repository{DB: db}
}

func (r *Repository) ListByUser(userID string) ([]FeatureRequest, error) {
	rows, err := r.DB.Query(`
		SELECT
			id, user_id,
			NULL AS user_name,
			NULL AS user_email,
			title, body, status, created_at, updated_at
		FROM feature_requests
		WHERE user_id = ?
		AND status != 'deleted'
		ORDER BY created_at DESC
		LIMIT 100
	`, userID)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	return scanFeatureRequests(rows)
}

func (r *Repository) ListAdmin(filter ListAdminFeatureRequestsFilter) ([]FeatureRequest, error) {
	args := []any{}

	where := "WHERE fr.status != 'deleted'"

	if strings.TrimSpace(filter.Status) != "" {
		where += " AND fr.status = ?"
		args = append(args, strings.TrimSpace(filter.Status))
	}

	args = append(args, filter.Limit)

	rows, err := r.DB.Query(`
		SELECT
			fr.id,
			fr.user_id,
			COALESCE(u.display_name, 'Unknown User') AS user_name,
			u.email,
			fr.title,
			fr.body,
			fr.status,
			fr.created_at,
			fr.updated_at
		FROM feature_requests fr
		LEFT JOIN users u
			ON u.id = fr.user_id
		`+where+`
		ORDER BY fr.created_at DESC
		LIMIT ?
	`, args...)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	return scanFeatureRequests(rows)
}

func (r *Repository) FindByUser(userID string, requestID string) (FeatureRequest, error) {
	row := r.DB.QueryRow(`
		SELECT
			id, user_id,
			NULL AS user_name,
			NULL AS user_email,
			title, body, status, created_at, updated_at
		FROM feature_requests
		WHERE id = ?
		AND user_id = ?
		AND status != 'deleted'
		LIMIT 1
	`, requestID, userID)

	return scanFeatureRequest(row)
}

func (r *Repository) FindAdmin(requestID string) (FeatureRequest, error) {
	row := r.DB.QueryRow(`
		SELECT
			fr.id,
			fr.user_id,
			COALESCE(u.display_name, 'Unknown User') AS user_name,
			u.email,
			fr.title,
			fr.body,
			fr.status,
			fr.created_at,
			fr.updated_at
		FROM feature_requests fr
		LEFT JOIN users u
			ON u.id = fr.user_id
		WHERE fr.id = ?
		AND fr.status != 'deleted'
		LIMIT 1
	`, requestID)

	return scanFeatureRequest(row)
}

func (r *Repository) Create(id string, userID string, title string, body string) error {
	_, err := r.DB.Exec(`
		INSERT INTO feature_requests (
			id,
			user_id,
			title,
			body,
			status
		)
		VALUES (?, ?, ?, ?, 'open')
	`, id, userID, title, body)

	return err
}

func (r *Repository) Update(userID string, requestID string, title string, body string) error {
	_, err := r.DB.Exec(`
		UPDATE feature_requests
		SET
			title = ?,
			body = ?,
			updated_at = CURRENT_TIMESTAMP
		WHERE id = ?
		AND user_id = ?
		AND status = 'open'
	`, title, body, requestID, userID)

	return err
}

func (r *Repository) SoftDelete(userID string, requestID string) error {
	_, err := r.DB.Exec(`
		UPDATE feature_requests
		SET
			status = 'deleted',
			updated_at = CURRENT_TIMESTAMP
		WHERE id = ?
		AND user_id = ?
		AND status = 'open'
	`, requestID, userID)

	return err
}

func (r *Repository) UpdateStatus(requestID string, status string) error {
	_, err := r.DB.Exec(`
		UPDATE feature_requests
		SET
			status = ?,
			updated_at = CURRENT_TIMESTAMP
		WHERE id = ?
		AND status != 'deleted'
	`, status, requestID)

	return err
}

type scanner interface {
	Scan(dest ...any) error
}

func scanFeatureRequests(rows *sql.Rows) ([]FeatureRequest, error) {
	items := []FeatureRequest{}

	for rows.Next() {
		item, err := scanFeatureRequest(rows)

		if err != nil {
			return nil, err
		}

		items = append(items, item)
	}

	return items, nil
}

func scanFeatureRequest(row scanner) (FeatureRequest, error) {
	var item FeatureRequest
	var userName sql.NullString
	var userEmail sql.NullString

	err := row.Scan(
		&item.ID,
		&item.UserID,
		&userName,
		&userEmail,
		&item.Title,
		&item.Body,
		&item.Status,
		&item.CreatedAt,
		&item.UpdatedAt,
	)

	if err != nil {
		return FeatureRequest{}, err
	}

	item.UserName = stringPtrFromNull(userName)
	item.UserEmail = stringPtrFromNull(userEmail)

	return item, nil
}

func stringPtrFromNull(value sql.NullString) *string {
	if !value.Valid {
		return nil
	}

	return &value.String
}
