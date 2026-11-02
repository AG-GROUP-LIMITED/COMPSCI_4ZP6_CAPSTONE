import json
import logging
import sqlite3
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


DATABASE = Path(__file__).with_name("projects.db")


def initialize_database():
    with sqlite3.connect(DATABASE) as connection:
        connection.execute(
            "CREATE TABLE IF NOT EXISTS projects ("
            "id INTEGER PRIMARY KEY AUTOINCREMENT, "
            "name TEXT NOT NULL)"
        )


class ProjectRequestHandler(BaseHTTPRequestHandler):
    def send_json(self, status_code, data):
        body = json.dumps(data).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if self.path != "/api/projects":
            self.send_json(404, {"error": "Not found"})
            return

        try:
            with sqlite3.connect(DATABASE) as connection:
                rows = connection.execute(
                    "SELECT id, name FROM projects ORDER BY id"
                ).fetchall()
            self.send_json(200, [{"id": row[0], "name": row[1]} for row in rows])
        except sqlite3.Error:
            logging.exception("Could not load projects")
            self.send_json(500, {"error": "Could not load projects"})

    def do_POST(self):
        if self.path != "/api/projects":
            self.send_json(404, {"error": "Not found"})
            return

        try:
            with sqlite3.connect(DATABASE) as connection:
                cursor = connection.execute(
                    "INSERT INTO projects (name) VALUES ('')"
                )
                project_id = cursor.lastrowid
                project_name = f"Project {project_id}"
                connection.execute(
                    "UPDATE projects SET name = ? WHERE id = ?",
                    (project_name, project_id),
                )
                project = {"id": project_id, "name": project_name}
            self.send_json(201, project)
        except sqlite3.Error:
            logging.exception("Could not create project")
            self.send_json(500, {"error": "Could not create project"})


if __name__ == "__main__":
    initialize_database()
    server = ThreadingHTTPServer(("127.0.0.1", 8000), ProjectRequestHandler)
    print("Python project API listening on http://127.0.0.1:8000")
    server.serve_forever()
