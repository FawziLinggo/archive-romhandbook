package reports

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

func (repository *Repository) ListByUser(userID string) ([]Report, error) {
	rows, err :=
		repository.DB.Query(`
			SELECT
				id,
				user_id,
				NULL AS user_name,
				NULL AS user_email,
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
		`, userID)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	return scanReports(rows)
}

func (repository *Repository) ListAdmin(filter ListAdminReportsFilter) ([]Report, error) {
	args :=
		[]any{}

	where :=
		"WHERE r.status != 'deleted'"

	if filter.Status != "" {
		where += " AND r.status = ?"
		args = append(args, filter.Status)
	}

	args = append(args, filter.Limit)

	rows, err :=
		repository.DB.Query(`
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
		return nil, err
	}

	defer rows.Close()

	return scanReports(rows)
}

func (repository *Repository) FindByUser(userID string, reportID string) (Report, error) {
	row :=
		repository.DB.QueryRow(`
			SELECT
				id,
				user_id,
				NULL AS user_name,
				NULL AS user_email,
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
		`, reportID, userID)

	return scanReport(row)
}

func (repository *Repository) FindAdmin(reportID string) (Report, error) {
	row :=
		repository.DB.QueryRow(`
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
			AND r.status != 'deleted'
			LIMIT 1
		`, reportID)

	return scanReport(row)
}

func (repository *Repository) Create(input CreateReportInput) error {
	_, err :=
		repository.DB.Exec(`
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
			input.ID,
			input.UserID,
			nullableTrim(input.TargetType),
			nullableTrim(input.TargetID),
			nullableTrim(input.TargetURL),
			input.Title,
			input.Body,
		)

	return err
}

func (repository *Repository) Update(input UpdateReportInput) error {
	_, err :=
		repository.DB.Exec(`
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
			nullableTrim(input.TargetType),
			nullableTrim(input.TargetID),
			nullableTrim(input.TargetURL),
			input.Title,
			input.Body,
			input.ID,
			input.UserID,
		)

	return err
}

func (repository *Repository) SoftDelete(userID string, reportID string) error {
	_, err :=
		repository.DB.Exec(`
			UPDATE reports
			SET
				status = 'deleted',
				updated_at = CURRENT_TIMESTAMP
			WHERE id = ?
			AND user_id = ?
			AND status = 'open'
		`, reportID, userID)

	return err
}

func (repository *Repository) UpdateStatus(reportID string, status string) error {
	_, err :=
		repository.DB.Exec(`
			UPDATE reports
			SET
				status = ?,
				updated_at = CURRENT_TIMESTAMP
			WHERE id = ?
			AND status != 'deleted'
		`, status, reportID)

	return err
}

type scanner interface {
	Scan(dest ...any) error
}

func scanReports(rows *sql.Rows) ([]Report, error) {
	items :=
		[]Report{}

	for rows.Next() {
		report, err :=
			scanReport(rows)

		if err != nil {
			return nil, err
		}

		items =
			append(items, report)
	}

	return items, nil
}

func scanReport(row scanner) (Report, error) {
	var report Report

	var userName sql.NullString
	var userEmail sql.NullString
	var targetType sql.NullString
	var targetID sql.NullString
	var targetURL sql.NullString

	err :=
		row.Scan(
			&report.ID,
			&report.UserID,
			&userName,
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
		return Report{}, err
	}

	report.UserName =
		stringPtrFromNull(userName)

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
