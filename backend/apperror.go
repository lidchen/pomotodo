package main

/*
| Case                 | Status | Code                |
| -------------------- | ------ | ------------------- |
| invalid input        | 400    | INVALID_INPUT       |
| unauthorized         | 401    | UNAUTHORIZED        |
| invalid password     | 401    | INVALID_CREDENTIALS |
| forbidden            | 403    | FORBIDDEN           |
| not found            | 404    | NOT_FOUND           |
| conflict (duplicate) 	| 409    | USER_ALREADY_EXISTS |
*/

type AppError struct {
	Code       string
	Message    string
	Err        error
	HTTPStatus int
}

func ErrUnAuthorized(code, message string) *AppError {
	return &AppError{
		Code:       code,
		Message:    message,
		HTTPStatus: 401,
	}
}

func ErrConflict(code, message string) *AppError {
	return &AppError{
		Code:       code,
		Message:    message,
		HTTPStatus: 409,
	}
}

func ErrNotFound(code, message string) *AppError {
	return &AppError{
		Code:       code,
		Message:    message,
		HTTPStatus: 404,
	}
}

func ErrBadRequest(message string) *AppError {
	return &AppError{
		Code:       "INVALID_INPUT",
		Message:    message,
		HTTPStatus: 400,
	}
}

func ErrInternal(err error) *AppError {
	return &AppError{
		Code:       "INTERNAL_ERROR",
		Message:    "internal server error: " + err.Error(),
		Err:        err,
		HTTPStatus: 500,
	}
}
