# Pomotodo

Pomotodo is a simple pomodoro-style task app with user authentication, task management, and focus/break timer support.

The project is split into two parts:

- A Go backend that exposes JSON APIs and talks to PostgreSQL.
- A browser frontend built with plain HTML, CSS, and JavaScript.

## Project Structure

### Backend

The backend lives in [backend/](backend) and is implemented as a Go HTTP server.

Main responsibilities:

- Start the server and connect to PostgreSQL.
- Expose routes for login, registration, and todo operations.
- Handle CRUD-style actions for tasks and pomodoro counters.
- Return JSON responses that the frontend can consume.

Key files:

- [main.go](backend/main.go) starts the server and opens the database connection.
- [http_api.go](backend/http_api.go) defines the HTTP routes and request handlers.
- [dbcrud.go](backend/dbcrud.go) contains database operations.
- [login.go](backend/login.go) handles authentication logic.
- [type.go](backend/type.go) defines the core data models.
- [apperror.go](backend/apperror.go) standardizes application errors.
- [pgconfig.go](backend/pgconfig.go) contains PostgreSQL configuration helpers.

Backend flow:

1. The server reads the database connection string from `POMOTODO_DSN`, or falls back to a local PostgreSQL config.
2. It creates the API handler and serves requests on `POMOTODO_ADDR` or `:3002` by default.
3. The API layer maps requests to database functions and responds with JSON.

### Frontend

The frontend lives in [frontend/app/](frontend/app) and is a static browser app.

Main responsibilities:

- Provide login and registration screens.
- Render the pomodoro timer and task list.
- Let users create, edit, complete, delete, and restore tasks through the backend API.
- Keep UI behavior split into small JavaScript modules.

Key files:

- [index.html](frontend/app/index.html) defines the page structure and loads the app scripts.
- [styles.css](frontend/app/styles.css) contains the custom styling.
- [js/app.js](frontend/app/js/app.js) coordinates the timer and top-level UI behavior.
- [js/auth.js](frontend/app/js/auth.js) handles authentication UI and state.
- [js/tasks.js](frontend/app/js/tasks.js) manages task rendering and task actions.
- [js/errors.js](frontend/app/js/errors.js) shows alerts, confirmations, and modal errors.
- [js/soundManager.js](frontend/app/js/soundManager.js) handles timer sound effects.
- [js/api/](frontend/app/js/api) contains API wrappers for auth and todo requests.

Frontend flow:

1. `index.html` loads the UI shell, fonts, Tailwind, and local styles.
2. The script files are loaded in a fixed order so shared API helpers are available before the UI modules.
3. The browser app talks to the backend through the JavaScript API service layer.

## Data Model

The application uses PostgreSQL tables for users and todos.

- `users` stores the account identity and hashed password.
- `todos` stores task content, completion state, and pomodoro count.

## Notes

These are personal reminders rather than project documentation:

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(32) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE todos (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users (id) ON DELETE CASCADE,title VARCHAR(255) NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  pomo_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

```bash
GOOS=linux GOARCH=amd64 go build -o pomotodo-backend .
```