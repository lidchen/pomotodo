package main

import "time"

type User struct {
	ID       int
	Username string
	Password string
}

type Todo struct {
	ID        int
	Title     string
	Completed bool
	PomoCount int
	CreatedAt time.Time
}
