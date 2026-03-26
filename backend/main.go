package main

import (
	"context"
	"database/sql"
	"flag"
	"io"
	"log"
	"strconv"
	"time"

	embeddedpostgres "github.com/fergusstrange/embedded-postgres" // embedded postgres server.
	_ "github.com/jackc/pgx/v5"                                   // register the db driver
)

func main() {
	timeout := flag.Duration("timeout", 5*time.Second, "timeout for connecting to postgres")
	flag.Parse()

	cfg, err := PgConfigFronEnv() // defined below
	if err != nil {
		log.Fatalf("postgres configuration error: %v", err)
	}
	// ---- setup embedded postgres server ----
	portN, err := strconv.Atoi(cfg.port)
	if err != nil {
		panic(err)
	}

	// we'll mirror the postgres config in the environment so that you can't actually get it 'wrong' when running
	// this example; you do need to set the environment variables, though.
	embeddedCfg := embeddedpostgres.DefaultConfig().
		Username(cfg.user).
		Password(cfg.password).
		Database(cfg.database).
		Port(uint32(portN)).
		Logger(io.Discard) // discard embedded postgres' logs; they're not helpful for this example

	embeddedDB := embeddedpostgres.NewDatabase(embeddedCfg)
	if err := embeddedDB.Start(); err != nil {
		panic(err)
	}
	log.Printf("postgres is running on: %s\n", embeddedCfg.GetConnectionURL())
	defer embeddedDB.Stop() // if we don't stop the database, it will continue running after our program exits and block the port.

	// ---- connect to postgres ----

	db, err := sql.Open(
		"postgres",
		cfg.String(), // defined below
	)
	if err != nil {
		panic(err)
	}
	defer db.Close() // always close the database when you're done with it.

	// always ping the database to ensure a connection is made.
	// any time you talk to a DB, use a context with a timeout, since DB connections could be lost or delayed indefinitely.
	ctx, cancel := context.WithTimeout(context.Background(), *timeout)
	defer cancel()
	if err := db.PingContext(ctx); err != nil {
		panic(err)
	}
	log.Println("ping successful")
}
