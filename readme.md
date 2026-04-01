# Create table
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

# Compile backend bin for server
GOOS=linux GOARCH=amd64 go build -o pomotodo-backend .