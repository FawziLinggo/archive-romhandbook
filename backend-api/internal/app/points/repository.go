package points

import "database/sql"

type Repository struct {
	DB *sql.DB
}

func NewRepository(db *sql.DB) *Repository {
	return &Repository{
		DB: db,
	}
}

func (repository *Repository) GetRulePoints(ruleCode string) (int, error) {
	var value int

	err :=
		repository.DB.QueryRow(`
			SELECT points
			FROM point_rules
			WHERE code = ?
			AND enabled = 1
			LIMIT 1
		`, ruleCode).Scan(&value)

	if err != nil {
		return 0, err
	}

	return value, nil
}

func (repository *Repository) InsertLedger(input AwardInput, points int) (bool, error) {
	result, err :=
		repository.DB.Exec(`
			INSERT OR IGNORE INTO user_points_ledger (
				user_id,
				points,
				reason,
				source_type,
				source_id
			)
			VALUES (?, ?, ?, ?, ?)
		`,
			input.UserID,
			points,
			input.RuleCode,
			input.SourceType,
			input.SourceID,
		)

	if err != nil {
		return false, err
	}

	affected, err :=
		result.RowsAffected()

	if err != nil {
		return false, err
	}

	return affected > 0, nil
}

func (repository *Repository) AddUserPoints(userID string, points int) error {
	tx, err :=
		repository.DB.Begin()

	if err != nil {
		return err
	}

	defer tx.Rollback()

	var totalPoints int

	err =
		tx.QueryRow(`
			SELECT points_total + ?
			FROM user_profiles
			WHERE user_id = ?
			LIMIT 1
		`, points, userID).Scan(&totalPoints)

	if err != nil {
		return err
	}

	var rankName string

	err =
		tx.QueryRow(`
			SELECT rank_name
			FROM rank_rules
			WHERE min_points <= ?
			ORDER BY min_points DESC
			LIMIT 1
		`, totalPoints).Scan(&rankName)

	if err != nil {
		return err
	}

	_, err =
		tx.Exec(`
			UPDATE user_profiles
			SET
				points_total = ?,
				rank_name = ?,
				updated_at = CURRENT_TIMESTAMP
			WHERE user_id = ?
		`, totalPoints, rankName, userID)

	if err != nil {
		return err
	}

	return tx.Commit()
}

func (repository *Repository) GetRankNameByPoints(points int) (string, error) {
	var rankName string

	err :=
		repository.DB.QueryRow(`
			SELECT rank_name
			FROM rank_rules
			WHERE min_points <= ?
			ORDER BY min_points DESC
			LIMIT 1
		`, points).Scan(&rankName)

	if err != nil {
		return "", err
	}

	return rankName, nil
}
