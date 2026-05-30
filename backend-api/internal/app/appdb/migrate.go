package appdb

import (
	"database/sql"
)

func Migrate(db *sql.DB) error {

	statements := []string{
		`
		CREATE TABLE IF NOT EXISTS users (
			id TEXT PRIMARY KEY,
			email TEXT  UNIQUE,
			display_name TEXT NOT NULL,
			avatar_url TEXT,
			provider TEXT NOT NULL,
			provider_user_id TEXT NOT NULL,
			role TEXT NOT NULL DEFAULT 'user',
			status TEXT NOT NULL DEFAULT 'active',
			created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
		);
		`,

		`CREATE INDEX IF NOT EXISTS idx_comments_target
		ON comments(target_type, target_id, created_at);`,

		`CREATE INDEX IF NOT EXISTS idx_comments_parent_id
		ON comments(parent_id);`,

		`CREATE INDEX IF NOT EXISTS idx_comments_user_id
			ON comments(user_id);`,
		`
		CREATE UNIQUE INDEX IF NOT EXISTS idx_users_provider_identity
		ON users(provider, provider_user_id);
		`,

		`
			CREATE TABLE IF NOT EXISTS user_profiles (
				user_id TEXT PRIMARY KEY,
				class_id TEXT,
				class_name TEXT,
				class_image TEXT,
				rank_name TEXT NOT NULL DEFAULT 'Novice',
				points_total INTEGER NOT NULL DEFAULT 0,
				bio TEXT,
				created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
				updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
				FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
			);
		`,
		`
		CREATE INDEX IF NOT EXISTS idx_reports_user_id
		ON reports(user_id, created_at);
		`,

		`
		CREATE INDEX IF NOT EXISTS idx_reports_status
		ON reports(status);
		`,

		`
		CREATE TABLE IF NOT EXISTS user_sessions (
			id TEXT PRIMARY KEY,
			user_id TEXT NOT NULL,
			session_token_hash TEXT NOT NULL UNIQUE,
			user_agent TEXT,
			ip_address TEXT,
			expires_at DATETIME NOT NULL,
			created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
			last_seen_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
			revoked_at DATETIME,
			FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
		);
		`,

		`
		CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id
		ON user_sessions(user_id);
		`,

		`
		CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at
		ON user_sessions(expires_at);
		`,

		`
		CREATE TABLE IF NOT EXISTS user_points_ledger (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			user_id TEXT NOT NULL,
			points INTEGER NOT NULL,
			reason TEXT NOT NULL,
			source_type TEXT,
			source_id TEXT,
			created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
		);
		`,

		`
		CREATE INDEX IF NOT EXISTS idx_user_points_ledger_user_id
		ON user_points_ledger(user_id);
		`,

		`
		CREATE TABLE IF NOT EXISTS comments (
			id TEXT PRIMARY KEY,
			user_id TEXT NOT NULL,
			target_type TEXT NOT NULL,
			target_id TEXT NOT NULL,
			parent_id TEXT,
			body TEXT NOT NULL,
			status TEXT NOT NULL DEFAULT 'visible',
			created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
			deleted_at DATETIME,
			FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
			FOREIGN KEY(parent_id) REFERENCES comments(id) ON DELETE CASCADE
		);
		`,

		`
		CREATE INDEX IF NOT EXISTS idx_comments_target
		ON comments(target_type, target_id, created_at);
		`,

		`
		CREATE TABLE IF NOT EXISTS reports (
			id TEXT PRIMARY KEY,
			user_id TEXT,
			target_type TEXT,
			target_id TEXT,
			target_url TEXT,
			title TEXT NOT NULL,
			body TEXT NOT NULL,
			status TEXT NOT NULL DEFAULT 'open',
			created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL
		);
		`,

		`
		CREATE TABLE IF NOT EXISTS feature_requests (
			id TEXT PRIMARY KEY,
			user_id TEXT,
			title TEXT NOT NULL,
			body TEXT NOT NULL,
			status TEXT NOT NULL DEFAULT 'open',
			created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL
		);
		`,

		`
			CREATE TABLE IF NOT EXISTS point_rules (
				code TEXT PRIMARY KEY,
				label TEXT NOT NULL,
				points INTEGER NOT NULL,
				enabled INTEGER NOT NULL DEFAULT 1,
				created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
				updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
			);
			`,

		`
			INSERT OR IGNORE INTO point_rules (
				code,
				label,
				points
			)
			VALUES
				('comment_activity', 'Comment activity', 1),
				('bug_report_accepted', 'Accepted bug report', 10),
				('bug_report_fixed', 'Fixed confirmed issue', 25),
				('feature_request_accepted', 'Accepted feature request', 10);
			`,

		`
			CREATE UNIQUE INDEX IF NOT EXISTS idx_user_points_ledger_unique_source
			ON user_points_ledger(user_id, reason, source_type, source_id);
			`,

		`
		CREATE TABLE IF NOT EXISTS rank_rules (
			rank_name TEXT PRIMARY KEY,
			min_points INTEGER NOT NULL,
			sort_order INTEGER NOT NULL,
			created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
		);
		`,

		`CREATE UNIQUE INDEX IF NOT EXISTS idx_user_points_ledger_unique_source
ON user_points_ledger(user_id, reason, source_type, source_id);`,

		`
		INSERT OR IGNORE INTO rank_rules (
			rank_name,
			min_points,
			sort_order
		)
		VALUES
			('Novice', 0, 1),
			('Adventurer', 25, 2),
			('Guardian', 100, 3),
			('Scholar', 250, 4),
			('Archivist', 500, 5),
			('Rune Keeper', 1000, 6),
			('Legend', 2000, 7);
		`,
	}

	for _, statement := range statements {
		_, err := db.Exec(statement)

		if err != nil {
			return err
		}
	}

	return nil
}
