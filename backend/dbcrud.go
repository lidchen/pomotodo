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
		}
		return ErrInternal(err)
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
		if err == sql.ErrNoRows {
			return nil, ErrNotFound("NOT_FOUND", "user not found")
		}
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
	rows, err := db.Query("SELECT id, title, completed, pomo_count, created_at FROM todos WHERE user_id=$1", userid)
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

func CreateTodo(db *sql.DB, userid, title string) (*Todo, *AppError) {
	var t Todo

	err := db.QueryRow(
		"INSERT INTO todos (user_id, title) VALUES ($1, $2) RETURNING id, title, completed, pomo_count, created_at",
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
		"DELETE FROM todos WHERE user_id=$1 AND id=$2",
		userid, id,
	)
	if err != nil {
		return ErrInternal(err)
	}
	return nil
}

func DeleteCompletedTodo(db *sql.DB, userid int) *AppError {
	_, err := db.Exec(
		"DELETE FROM todos WHERE user_id=$1 AND completed=true",
		userid,
	)
	if err != nil {
		return ErrInternal(err)
	}
	return nil
}

func ToogleTodoStatus(db *sql.DB, userid, id int) (*Todo, *AppError) {
	t, apperr := getTodoById(db, userid, id)
	if apperr != nil {
		return nil, apperr
	}

	newCompleted := !t.Completed
	_, err := db.Exec("UPDATE todos SET completed=$1 where id=$2 AND user_id=$3", newCompleted, id, userid)
	if err != nil {
		if pgErr, ok := err.(*pq.Error); ok {
			switch pgErr.Code {
			case "42703": // undefined_column
				return nil, ErrNotFound("NOT_FOUND", "todo not found")
			}
		}
		return nil, ErrInternal(err)
	}
	t.Completed = newCompleted
	return t, nil
}

func AlterTodo(db *sql.DB, userid, id int, title string) (*Todo, *AppError) {
	var t Todo

	err := db.QueryRow(
		"UPDATE todos SET title=$1 WHERE user_id=$2 AND id=$3 RETURNING id, title, completed, pomo_count, created_at",
		title, userid, id,
	).Scan(&t.ID, &t.Title, &t.Completed, &t.PomoCount, &t.CreatedAt)

	if err != nil {
		return nil, ErrInternal(err)
	}
	return &t, nil
}

func IncrementPomo(db *sql.DB, userid, id int) (*Todo, *AppError) {
	var t Todo

	err := db.QueryRow(
		"UPDATE todos SET pomo_count=pomo_count+1 WHERE user_id=$1 AND id=$2 RETURNING id, title, completed, pomo_count, created_at",
		userid, id,
	).Scan(&t.ID, &t.Title, &t.Completed, &t.PomoCount, &t.CreatedAt)

	// TODO: Check err type (user not exist / cant create...)
	if err != nil {
		return nil, ErrInternal(err)
	}
	return &t, nil
}

func getTodoById(db *sql.DB, userid, id int) (*Todo, *AppError) {
	row := db.QueryRow(
		"SELECT id, title, completed, pomo_count, created_at FROM todos WHERE user_id=$1 AND id=$2",
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
