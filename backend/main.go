package main

import (
	"database/sql"
	"fmt"

	_ "github.com/lib/pq"
)

func main() {
	connStr := "host=localhost port=5433 user=admin password=admin dbname=pomotodo sslmode=disable"

	db, err := sql.Open("postgres", connStr)
	if err != nil {
		panic(err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		panic(err)
	}

	if err := CreateUser(db, "test1", "test"); err != nil {
		panic(err)
	}

	fmt.Println("connected")
}
