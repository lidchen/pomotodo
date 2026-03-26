package main

import "errors"

var (
	ErrUserAlreadyExists = errors.New("USER_ALREADY_EXISTS")
	ErrInvalidInput      = errors.New("INVALID_INPUT")
	ErrInternal          = errors.New("INTERNAL_ERROR")
)
