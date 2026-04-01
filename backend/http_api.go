package main

import (
	"database/sql"
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
)

type API struct {
	db *sql.DB
}

func NewAPI(db *sql.DB) *API {
	return &API{db: db}
}

type apiErrorBody struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

type apiResponse struct {
	Success bool          `json:"success"`
	Data    any           `json:"data,omitempty"`
	Error   *apiErrorBody `json:"error,omitempty"`
}

type authRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type createTodoRequest struct {
	UserID int    `json:"user_id"`
	Title  string `json:"title"`
}

type updateTodoRequest struct {
	UserId int    `json:"user_id"`
	Id     int    `json:"id"`
	Title  string `json:"title"`
}

type userResponse struct {
	ID       int    `json:"id"`
	Username string `json:"username"`
}

type todoResponse struct {
	ID        int    `json:"id"`
	Title     string `json:"title"`
	Completed bool   `json:"completed"`
	PomoCount int    `json:"pomo_count"`
	CreatedAt string `json:"created_at"`
}

func (a *API) Routes() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /healthz", a.handleHealth)
	mux.HandleFunc("POST /api/register", a.handleRegister)
	mux.HandleFunc("POST /api/login", a.handleLogin)
	mux.HandleFunc("GET /api/todos", a.handleListTodos)
	mux.HandleFunc("POST /api/todos", a.handleCreateTodo)
	mux.HandleFunc("PATCH /api/todos/toggle", a.handleToggleTodo)
	mux.HandleFunc("POST /api/todos/pomo", a.handleIncrementPomo)
	mux.HandleFunc("DELETE /api/todos", a.handleDeleteTodo)
	mux.HandleFunc("DELETE /api/completed-todos", a.handleDeleteCompletedTodo)
	mux.HandleFunc("PATCH /api/todos/title", a.handleUpdateTodoTitle)

	return withCORS(mux)
}

func withCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func (a *API) handleHealth(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, apiResponse{Success: true, Data: map[string]string{"status": "ok"}})
}

func (a *API) handleRegister(w http.ResponseWriter, r *http.Request) {
	var req authRequest
	if err := decodeJSON(r, &req); err != nil {
		writeAppError(w, ErrBadRequest(err.Error()))
		return
	}
	if req.Username == "" || req.Password == "" {
		writeAppError(w, ErrBadRequest("username and password are required"))
		return
	}

	appErr := CreateUser(a.db, req.Username, req.Password)
	if appErr != nil {
		writeAppError(w, appErr)
		return
	}

	u, appErr := GetUserByUsername(a.db, req.Username)
	if appErr != nil {
		writeAppError(w, appErr)
		return
	}

	writeJSON(w, http.StatusCreated, apiResponse{Success: true, Data: toUserResponse(*u)})
}

func (a *API) handleLogin(w http.ResponseWriter, r *http.Request) {
	var req authRequest
	if err := decodeJSON(r, &req); err != nil {
		writeAppError(w, ErrBadRequest(err.Error()))
		return
	}
	if req.Username == "" || req.Password == "" {
		writeAppError(w, ErrBadRequest("username and password are required"))
		return
	}

	u, appErr := Login(a.db, req.Username, req.Password)
	if appErr != nil {
		writeAppError(w, appErr)
		return
	}

	writeJSON(w, http.StatusOK, apiResponse{Success: true, Data: toUserResponse(*u)})
}

func (a *API) handleListTodos(w http.ResponseWriter, r *http.Request) {
	userID, appErr := readIntQuery(r, "user_id")
	if appErr != nil {
		writeAppError(w, appErr)
		return
	}

	todos, appErr := GetTodosByUser(a.db, userID)
	if appErr != nil {
		writeAppError(w, appErr)
		return
	}

	resp := make([]todoResponse, 0, len(todos))
	for _, t := range todos {
		resp = append(resp, toTodoResponse(t))
	}

	writeJSON(w, http.StatusOK, apiResponse{Success: true, Data: resp})
}

func (a *API) handleCreateTodo(w http.ResponseWriter, r *http.Request) {
	var req createTodoRequest
	if err := decodeJSON(r, &req); err != nil {
		writeAppError(w, ErrBadRequest(err.Error()))
		return
	}
	if req.UserID <= 0 || req.Title == "" {
		writeAppError(w, ErrBadRequest("user_id and title are required"))
		return
	}

	todo, appErr := CreateTodo(a.db, strconv.Itoa(req.UserID), req.Title)
	if appErr != nil {
		writeAppError(w, appErr)
		return
	}

	writeJSON(w, http.StatusCreated, apiResponse{Success: true, Data: toTodoResponse(*todo)})
}

func (a *API) handleToggleTodo(w http.ResponseWriter, r *http.Request) {
	userID, appErr := readIntQuery(r, "user_id")
	if appErr != nil {
		writeAppError(w, appErr)
		return
	}
	id, appErr := readIntQuery(r, "id")
	if appErr != nil {
		writeAppError(w, appErr)
		return
	}

	todo, appErr := ToogleTodoStatus(a.db, userID, id)
	if appErr != nil {
		writeAppError(w, appErr)
		return
	}

	writeJSON(w, http.StatusOK, apiResponse{Success: true, Data: toTodoResponse(*todo)})
}

func (a *API) handleIncrementPomo(w http.ResponseWriter, r *http.Request) {
	userID, appErr := readIntQuery(r, "user_id")
	if appErr != nil {
		writeAppError(w, appErr)
		return
	}
	id, appErr := readIntQuery(r, "id")
	if appErr != nil {
		writeAppError(w, appErr)
		return
	}

	todo, appErr := IncrementPomo(a.db, userID, id)
	if appErr != nil {
		writeAppError(w, appErr)
		return
	}

	writeJSON(w, http.StatusOK, apiResponse{Success: true, Data: toTodoResponse(*todo)})
}

func (a *API) handleDeleteTodo(w http.ResponseWriter, r *http.Request) {
	userID, appErr := readIntQuery(r, "user_id")
	if appErr != nil {
		writeAppError(w, appErr)
		return
	}
	id, appErr := readIntQuery(r, "id")
	if appErr != nil {
		writeAppError(w, appErr)
		return
	}

	appErr = DeleteTodo(a.db, userID, id)
	if appErr != nil {
		writeAppError(w, appErr)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (a *API) handleDeleteCompletedTodo(w http.ResponseWriter, r *http.Request) {
	userID, appErr := readIntQuery(r, "user_id")
	if appErr != nil {
		writeAppError(w, appErr)
		return
	}

	appErr = DeleteCompletedTodo(a.db, userID)
	if appErr != nil {
		writeAppError(w, appErr)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (a *API) handleUpdateTodoTitle(w http.ResponseWriter, r *http.Request) {
	var req updateTodoRequest
	if err := decodeJSON(r, &req); err != nil {
		writeAppError(w, ErrBadRequest(err.Error()))
		return
	}
	if req.UserId <= 0 || req.Id <= 0 || req.Title == "" {
		writeAppError(w, ErrBadRequest("user_id, id and title are required"))
		return
	}

	todo, appErr := UpdateTodoTitle(a.db, req.UserId, req.Id, req.Title)
	if appErr != nil {
		writeAppError(w, appErr)
		return
	}

	writeJSON(w, http.StatusCreated, apiResponse{Success: true, Data: toTodoResponse(*todo)})
}

func readIntQuery(r *http.Request, key string) (int, *AppError) {
	value := r.URL.Query().Get(key)
	if value == "" {
		return 0, ErrBadRequest(key + " is required")
	}

	n, err := strconv.Atoi(value)
	if err != nil || n <= 0 {
		return 0, ErrBadRequest(key + " must be a positive integer")
	}
	return n, nil
}

func decodeJSON(r *http.Request, out any) error {
	defer r.Body.Close()
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	if err := dec.Decode(out); err != nil {
		return errors.New("invalid JSON payload")
	}
	return nil
}

func writeAppError(w http.ResponseWriter, appErr *AppError) {
	writeJSON(w, appErr.HTTPStatus, apiResponse{
		Success: false,
		Error: &apiErrorBody{
			Code:    appErr.Code,
			Message: appErr.Message,
		},
	})
}

func writeJSON(w http.ResponseWriter, status int, payload apiResponse) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}

func toUserResponse(u User) userResponse {
	return userResponse{ID: u.ID, Username: u.Username}
}

func toTodoResponse(t Todo) todoResponse {
	return todoResponse{
		ID:        t.ID,
		Title:     t.Title,
		Completed: t.Completed,
		PomoCount: t.PomoCount,
		CreatedAt: t.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}
}
