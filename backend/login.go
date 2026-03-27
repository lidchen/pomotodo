package main

import (
	"database/sql"
)

func Login(db *sql.DB, username, password string) (*User, *AppError) {
	user, err := GetUserByUsername(db, username)
	if err != nil {
		return nil, err
	}

	// TODO: implement hash password
	// err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
	if user.Password != username {
		return nil, ErrUnAuthorized("INVALID_CREDENTIALS", "invalid password")
	}

	return user, nil
}
