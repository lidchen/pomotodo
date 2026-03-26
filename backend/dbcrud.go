package main

import (
	"database/sql"

	"github.com/lib/pq"
)

func CreateUser(db *sql.DB, username, password_hash string) error {
	_, err := db.Exec(
		"INSERT INTO users (username, password_hash) VALUES ($1, $2)", username, password_hash,
	)

	if err != nil {
		if pgErr, ok := err.(*pq.Error); ok {
			switch pgErr.Code {
			case "23505": // unique_violation
				return ErrUserAlreadyExists
			}
		}
		return err
	}

	return nil
}
