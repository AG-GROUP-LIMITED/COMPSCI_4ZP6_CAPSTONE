#!/bin/bash

cd frontend ; npm run dev &
npm_pid=$!
python3 ../backend/server.py &
backend_pid=$!

cleanup() {
	trap - EXIT INT TERM
	kill "$npm_pid" "$backend_pid" 2>/dev/null
	wait "$npm_pid" "$backend_pid" 2>/dev/null
}

trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

wait