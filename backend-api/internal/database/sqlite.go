package database

import (
	"database/sql"
	"fmt"

	_ "modernc.org/sqlite"
)

func NewSQLite(

	dbPath string,

) (

	*sql.DB,
	error,

) {

	db, err := sql.Open(

		"sqlite",

		dbPath,
	)

	if err != nil {

		return nil, err
	}

	// =====================
	// TEST CONNECTION
	// =====================

	err = db.Ping()

	if err != nil {

		return nil, err
	}

	// =====================
	// SQLITE OPTIMIZATION
	// =====================

	pragmas := []string{

		"PRAGMA journal_mode = WAL;",
		"PRAGMA synchronous = NORMAL;",
		"PRAGMA foreign_keys = ON;",
		"PRAGMA temp_store = MEMORY;",
		"PRAGMA cache_size = -20000;",
	}

	for _, pragma := range pragmas {

		_, err := db.Exec(pragma)

		if err != nil {

			return nil, fmt.Errorf(

				"failed pragma: %v",
				err,
			)
		}
	}

	return db, nil
}
