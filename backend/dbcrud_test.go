package main

import (
	"fmt"
	"regexp"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/lib/pq"
)

func TestCreateUserSuccess(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("failed to create sqlmock: %v", err)
	}
	defer db.Close()

	query := regexp.QuoteMeta("INSERT INTO users (username, password_hash) VALUES ($1, $2)")
	mock.ExpectExec(query).
		WithArgs("alice", "hash123").
		WillReturnResult(sqlmock.NewResult(1, 1))

	appErr := CreateUser(db, "alice", "hash123")
	if appErr != nil {
		t.Fatalf("expected nil error, got: %+v", appErr)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Fatalf("unmet sql expectations: %v", err)
	}
}

func TestCreateUserDuplicate(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("failed to create sqlmock: %v", err)
	}
	defer db.Close()

	query := regexp.QuoteMeta("INSERT INTO users (username, password_hash) VALUES ($1, $2)")
	mock.ExpectExec(query).
		WithArgs("alice", "hash123").
		WillReturnError(&pq.Error{Code: "23505"})

	appErr := CreateUser(db, "alice", "hash123")
	if appErr == nil {
		t.Fatal("expected conflict error, got nil")
	}
	if appErr.Code != "USER_ALREADY_EXISTS" {
		t.Fatalf("expected USER_ALREADY_EXISTS, got %s", appErr.Code)
	}
	if appErr.HTTPStatus != 409 {
		t.Fatalf("expected 409, got %d", appErr.HTTPStatus)
	}

	if err := mock.ExpectationsWereMet(); err != nil {
		t.Fatalf("unmet sql expectations: %v", err)
	}
}

func TestGetUserByUsernameSuccess(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("failed to create sqlmock: %v", err)
	}
	defer db.Close()

	query := regexp.QuoteMeta("SELECT id, username, password_hash FROM users WHERE username=$1")
	rows := sqlmock.NewRows([]string{"id", "username", "password_hash"}).
		AddRow(1, "alice", "hash123")
	mock.ExpectQuery(query).WithArgs("alice").WillReturnRows(rows)

	u, appErr := GetUserByUsername(db, "alice")
	if appErr != nil {
		t.Fatalf("expected nil error, got: %+v", appErr)
	}
	if u == nil {
		t.Fatal("expected user, got nil")
	}
	if u.ID != 1 || u.Username != "alice" || u.Password != "hash123" {
		t.Fatalf("unexpected user: %+v", *u)
	}

	if err := mock.ExpectationsWereMet(); err != nil {
		t.Fatalf("unmet sql expectations: %v", err)
	}
}

func TestGetUserByUsernameNotFoundMapping(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("failed to create sqlmock: %v", err)
	}
	defer db.Close()

	query := regexp.QuoteMeta("SELECT id, username, password_hash FROM users WHERE username=$1")
	mock.ExpectQuery(query).WithArgs("ghost").WillReturnError(&pq.Error{Code: "42703"})

	u, appErr := GetUserByUsername(db, "ghost")
	if u != nil {
		t.Fatalf("expected nil user, got %+v", *u)
	}
	if appErr == nil {
		t.Fatal("expected not found error, got nil")
	}
	if appErr.Code != "NOT_FOUND" {
		t.Fatalf("expected NOT_FOUND, got %s", appErr.Code)
	}
	if appErr.HTTPStatus != 404 {
		t.Fatalf("expected 404, got %d", appErr.HTTPStatus)
	}

	if err := mock.ExpectationsWereMet(); err != nil {
		t.Fatalf("unmet sql expectations: %v", err)
	}
}

func TestGetTodosByUserSuccess(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("failed to create sqlmock: %v", err)
	}
	defer db.Close()

	query := regexp.QuoteMeta("SELECT id, title, completed, pomo_count, created_at FROM todos WHERE user_id=$1")
	now := time.Date(2026, 3, 27, 12, 0, 0, 0, time.UTC)
	rows := sqlmock.NewRows([]string{"id", "title", "completed", "pomo_count", "created_at"}).
		AddRow(1, "first", false, 0, now).
		AddRow(2, "second", true, 3, now)
	mock.ExpectQuery(query).WithArgs(9).WillReturnRows(rows)

	todos, appErr := GetTodosByUser(db, 9)
	if appErr != nil {
		t.Fatalf("expected nil error, got: %+v", appErr)
	}
	if len(todos) != 2 {
		t.Fatalf("expected 2 todos, got %d", len(todos))
	}
	if todos[1].Title != "second" || !todos[1].Completed || todos[1].PomoCount != 3 {
		t.Fatalf("unexpected todo: %+v", todos[1])
	}

	if err := mock.ExpectationsWereMet(); err != nil {
		t.Fatalf("unmet sql expectations: %v", err)
	}
}

func TestCreateTodoSuccess(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("failed to create sqlmock: %v", err)
	}
	defer db.Close()

	query := regexp.QuoteMeta("INSERT INTO todos (user_id, title) VALUES ($1, $2) RETURNING id, title, completed, pomo_count, created_at")
	now := time.Date(2026, 3, 27, 12, 30, 0, 0, time.UTC)
	rows := sqlmock.NewRows([]string{"id", "title", "completed", "pomo_count", "created_at"}).
		AddRow(11, "write tests", false, 0, now)
	mock.ExpectQuery(query).WithArgs("9", "write tests").WillReturnRows(rows)

	todo, appErr := CreateTodo(db, "9", "write tests")
	if appErr != nil {
		t.Fatalf("expected nil error, got: %+v", appErr)
	}
	if todo == nil {
		t.Fatal("expected todo, got nil")
	}
	if todo.ID != 11 || todo.Title != "write tests" {
		t.Fatalf("unexpected todo: %+v", *todo)
	}

	if err := mock.ExpectationsWereMet(); err != nil {
		t.Fatalf("unmet sql expectations: %v", err)
	}
}

func TestDeleteTodoSuccess(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("failed to create sqlmock: %v", err)
	}
	defer db.Close()

	query := regexp.QuoteMeta("DELETE FROM todos WHERE user_id=$1 AND id=$2")
	mock.ExpectExec(query).WithArgs(9, 3).WillReturnResult(sqlmock.NewResult(0, 1))

	appErr := DeleteTodo(db, 9, 3)
	if appErr != nil {
		t.Fatalf("expected nil error, got: %+v", appErr)
	}

	if err := mock.ExpectationsWereMet(); err != nil {
		t.Fatalf("unmet sql expectations: %v", err)
	}
}

func TestToggleTodoStatusSuccess(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("failed to create sqlmock: %v", err)
	}
	defer db.Close()

	getQuery := regexp.QuoteMeta("SELECT id, title, completed, pomo_count, created_at FROM todos WHERE user_id=$1 AND id=$2")
	now := time.Date(2026, 3, 27, 13, 0, 0, 0, time.UTC)
	getRows := sqlmock.NewRows([]string{"id", "title", "completed", "pomo_count", "created_at"}).
		AddRow(3, "task", false, 1, now)
	mock.ExpectQuery(getQuery).WithArgs(9, 3).WillReturnRows(getRows)

	updateQuery := regexp.QuoteMeta("UPDATE todos SET completed=$1 where id=$2 AND user_id=$3")
	mock.ExpectExec(updateQuery).WithArgs(true, 3, 9).WillReturnResult(sqlmock.NewResult(0, 1))

	todo, appErr := ToogleTodoStatus(db, 9, 3)
	if appErr != nil {
		t.Fatalf("expected nil error, got: %+v", appErr)
	}
	if todo == nil {
		t.Fatal("expected todo, got nil")
	}
	if todo.ID != 3 || todo.Title != "task" {
		t.Fatalf("unexpected todo: %+v", *todo)
	}

	if err := mock.ExpectationsWereMet(); err != nil {
		t.Fatalf("unmet sql expectations: %v", err)
	}
}

func TestCreateTodoInternalError(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("failed to create sqlmock: %v", err)
	}
	defer db.Close()

	query := regexp.QuoteMeta("INSERT INTO todos (user_id, title) VALUES ($1, $2) RETURNING id, title, completed, pomo_count, created_at")
	mock.ExpectQuery(query).WithArgs("9", "boom").WillReturnError(fmt.Errorf("insert failed"))

	todo, appErr := CreateTodo(db, "9", "boom")
	if todo != nil {
		t.Fatalf("expected nil todo, got %+v", *todo)
	}
	if appErr == nil {
		t.Fatal("expected internal error, got nil")
	}
	if appErr.Code != "INTERNAL_ERROR" {
		t.Fatalf("expected INTERNAL_ERROR, got %s", appErr.Code)
	}

	if err := mock.ExpectationsWereMet(); err != nil {
		t.Fatalf("unmet sql expectations: %v", err)
	}
}

func TestIncrementPomoSuccess(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("failed to create sqlmock: %v", err)
	}
	defer db.Close()

	query := regexp.QuoteMeta("UPDATE todos SET pomo_count=pomo_count+1 WHERE user_id=$1 AND id=$2 RETURNING id, title, completed, pomo_count, created_at")
	now := time.Date(2026, 3, 27, 14, 0, 0, 0, time.UTC)
	rows := sqlmock.NewRows([]string{"id", "title", "completed", "pomo_count", "created_at"}).
		AddRow(5, "study", false, 4, now)
	mock.ExpectQuery(query).WithArgs(9, 5).WillReturnRows(rows)

	todo, appErr := IncrementPomo(db, 9, 5)
	if appErr != nil {
		t.Fatalf("expected nil error, got: %+v", appErr)
	}
	if todo == nil {
		t.Fatal("expected todo, got nil")
	}
	if todo.ID != 5 || todo.PomoCount != 4 || todo.Title != "study" {
		t.Fatalf("unexpected todo: %+v", *todo)
	}

	if err := mock.ExpectationsWereMet(); err != nil {
		t.Fatalf("unmet sql expectations: %v", err)
	}
}

func TestIncrementPomoInternalError(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("failed to create sqlmock: %v", err)
	}
	defer db.Close()

	query := regexp.QuoteMeta("UPDATE todos SET pomo_count=pomo_count+1 WHERE user_id=$1 AND id=$2 RETURNING id, title, completed, pomo_count, created_at")
	mock.ExpectQuery(query).WithArgs(9, 5).WillReturnError(fmt.Errorf("update failed"))

	todo, appErr := IncrementPomo(db, 9, 5)
	if todo != nil {
		t.Fatalf("expected nil todo, got %+v", *todo)
	}
	if appErr == nil {
		t.Fatal("expected internal error, got nil")
	}
	if appErr.Code != "INTERNAL_ERROR" {
		t.Fatalf("expected INTERNAL_ERROR, got %s", appErr.Code)
	}
	if appErr.HTTPStatus != 500 {
		t.Fatalf("expected 500, got %d", appErr.HTTPStatus)
	}

	if err := mock.ExpectationsWereMet(); err != nil {
		t.Fatalf("unmet sql expectations: %v", err)
	}
}
