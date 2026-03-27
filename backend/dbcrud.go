package main

import (
	"database/sql"

	"github.com/lib/pq"
)

func CreateUser(db *sql.DB, username, password_hash string) *AppError {
	_, err := db.Exec(
		"INSERT INTO users (username, password_hash) VALUES ($1, $2)", username, password_hash,
	)

	if err != nil {
		if pgErr, ok := err.(*pq.Error); ok {
			switch pgErr.Code {
			case "23505": // unique_violation
				return ErrConflict("USER_ALREADY_EXISTS", "user already exists")
			}
			return ErrInternal(err)
		}
	}
	return nil
}

func GetUserByUsername(db *sql.DB, username string) (*User, *AppError) {
	row := db.QueryRow(
		"SELECT id, username, password_hash FROM users WHERE username=$1", username,
	)
	var u User
	err := row.Scan(&u.ID, &u.Username, &u.Password)
	if err != nil {
		if pgErr, ok := err.(*pq.Error); ok {
			switch pgErr.Code {
			case "42703": // undefined_column
				return nil, ErrNotFound("NOT_FOUND", "user not found")
			}
		}
		return nil, ErrInternal(err)
	}
	return &u, nil
}

func GetTodosByUser(db *sql.DB, userid int) ([]Todo, *AppError) {
	rows, err := db.Query("SELECT id, title, completed, pomo_count created_at FROM todos WHERE user_id=$1", userid)
	if err != nil {
		return nil, ErrInternal(err)
	}
	defer rows.Close()

	var todos []Todo
	for rows.Next() {
		var t Todo
		err := rows.Scan(&t.ID, &t.Title, &t.Completed, &t.PomoCount, &t.CreatedAt)
		if err != nil {
			return nil, ErrInternal(err)
		}
		todos = append(todos, t)
	}
	return todos, nil
}

func ToogleTodoStatus(db *sql.DB, userid, id int) (*Todo, *AppError) {
	t, apperr := getTodoById(db, userid, id)
	if apperr != nil {
		return nil, apperr
	}

	_, err := db.Exec("UPDATE todos SET completed=$1 where id=$2 AND userid=$3", t.Completed, id, userid)
	if err != nil {
		if pgErr, ok := err.(*pq.Error); ok {
			switch pgErr.Code {
			case "42703": // undefined_column
				return nil, ErrNotFound("NOT_FOUND", "todo not found")
			}
		}
		return nil, ErrInternal(err)
	}
	return t, nil
}

func CreateTodo(db *sql.DB, userid, title string) (*Todo, *AppError) {
	var t Todo

	err := db.QueryRow(
		"INSERT INTO todos (userid, title) VALUES ($1, $2) RETURNING id, title, completed, pomo_count, created_at",
		userid, title,
	).Scan(&t.ID, &t.Title, &t.Completed, &t.PomoCount, &t.CreatedAt)

	// TODO: Check err type (user not exist / cant create...)
	if err != nil {
		return nil, ErrInternal(err)
	}

	return &t, nil
}

func DeleteTodo(db *sql.DB, userid, id int) *AppError {
	_, err := db.Exec(
		"DELETE FROM todos WHERE userid=$1, id=$2",
		userid, id,
	)
	if err != nil {
		return ErrInternal(err)
	}
	return nil
}

func getTodoById(db *sql.DB, userid, id int) (*Todo, *AppError) {
	row := db.QueryRow(
		"SELECT id, title, completed, pomo_count, create_at FROM todos WHERE userid=$1, id=$2",
		userid, id,
	)
	var t Todo
	err := row.Scan(&t.ID, &t.Title, &t.Completed, &t.PomoCount, &t.CreatedAt)
	if err != nil {
		if pgErr, ok := err.(*pq.Error); ok {
			switch pgErr.Code {
			case "42703": // undefined_column
				return nil, ErrNotFound("NOT_FOUND", "todo not found")
			}
		}
		return nil, ErrInternal(err)
	}
	return &t, nil
}
