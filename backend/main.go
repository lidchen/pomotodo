package main

import (
	"database/sql"
	"log"
	"net/http"
	"os"

	_ "github.com/lib/pq"
)

func main() {
	connStr := os.Getenv("POMOTODO_DSN")
	if connStr == "" {
		connStr = "host=localhost port=5432 user=admin password=admin dbname=pomotodo sslmode=disable"
	}

	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatalf("open db: %v", err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Fatalf("ping db: %v", err)
	}

	api := NewAPI(db)
	addr := os.Getenv("POMOTODO_ADDR")
	if addr == "" {
		addr = ":3002"
	}

	log.Printf("pomotodo backend listening on %s", addr)
	if err := http.ListenAndServe(addr, api.Routes()); err != nil {
		log.Fatalf("server: %v", err)
	}
}
