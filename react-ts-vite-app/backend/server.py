import hashlib
import json
import logging
import re
import secrets
import sqlite3
from contextlib import contextmanager
from datetime import datetime
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit

DATABASE = Path(__file__).with_name("projects.db")
DEMO_OWNER_EMAIL = "demo.owner@local.invalid"

SCHEMA = (
    'CREATE TABLE IF NOT EXISTS "User" ('
    "UserID INTEGER PRIMARY KEY AUTOINCREMENT, "
    "Name TEXT NOT NULL, "
    "Email TEXT NOT NULL UNIQUE, "
    "PasswordHash TEXT NOT NULL)",
    'CREATE TABLE IF NOT EXISTS "Project" ('
    "ProjectID INTEGER PRIMARY KEY AUTOINCREMENT, "
    'OwnerID INTEGER NOT NULL REFERENCES "User"(UserID), '
    "Created TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, "
    "Description TEXT)",
    'CREATE TABLE IF NOT EXISTS "Collaborators" ('
    "ProjectID INTEGER NOT NULL, "
    "UserID INTEGER NOT NULL, "
    "PRIMARY KEY (ProjectID, UserID), "
    'UNIQUE (UserID, ProjectID), '
    'FOREIGN KEY (ProjectID) REFERENCES "Project"(ProjectID), '
    'FOREIGN KEY (UserID) REFERENCES "User"(UserID))',
    'CREATE TABLE IF NOT EXISTS "Node" ('
    "TaskID INTEGER PRIMARY KEY AUTOINCREMENT, "
    "ProjectID INTEGER NOT NULL, "
    "ParentID INTEGER, "
    "Title TEXT NOT NULL, "
    "Description TEXT, "
    "Created TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, "
    "LastUpdated TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, "
    "Deadline TEXT NOT NULL, "
    "NodeType TEXT NOT NULL DEFAULT 'Task' "
    "CHECK (NodeType IN ('Task', 'Document', 'Test')), "
    "Progress TEXT NOT NULL DEFAULT 'Not Started' "
    "CHECK (Progress IN ('Not Started', 'In Progress', 'Finished')), "
    "Assignee INTEGER, "
    "UNIQUE (ProjectID, TaskID), "
    'FOREIGN KEY (ProjectID) REFERENCES "Project"(ProjectID), '
    'FOREIGN KEY (ProjectID, ParentID) REFERENCES "Node"(ProjectID, TaskID), '
    'FOREIGN KEY (ProjectID, Assignee) '
    'REFERENCES "Collaborators"(ProjectID, UserID))',
    'CREATE TABLE IF NOT EXISTS "Comments" ('
    "CommentID INTEGER PRIMARY KEY AUTOINCREMENT, "
    "TaskID INTEGER NOT NULL, "
    "ProjectID INTEGER NOT NULL, "
    "UserID INTEGER NOT NULL, "
    "Comment TEXT NOT NULL, "
    'FOREIGN KEY (ProjectID, TaskID) REFERENCES "Node"(ProjectID, TaskID), '
    'FOREIGN KEY (UserID, ProjectID) '
    'REFERENCES "Collaborators"(UserID, ProjectID))',
)


@contextmanager
def connect_database():
    connection = sqlite3.connect(DATABASE)
    connection.execute("PRAGMA foreign_keys = ON")
    try:
        with connection:
            yield connection
    finally:
        connection.close()


def initialize_database():
    with connect_database() as connection:
        for statement in SCHEMA:
            connection.execute(statement)

        salt = secrets.token_bytes(16)
        password_hash = hashlib.pbkdf2_hmac(
            "sha256", secrets.token_bytes(32), salt, 600_000
        )
        stored_hash = f"pbkdf2_sha256$600000${salt.hex()}${password_hash.hex()}"
        connection.execute(
            'INSERT OR IGNORE INTO "User" (Name, Email, PasswordHash) '
            "VALUES (?, ?, ?)",
            ("Local Demo Owner", DEMO_OWNER_EMAIL, stored_hash),
        )
        owner_id = connection.execute(
            'SELECT UserID FROM "User" WHERE Email = ?', (DEMO_OWNER_EMAIL,)
        ).fetchone()[0]

        legacy_table = connection.execute(
            "SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'projects'"
        ).fetchone()
        if legacy_table:
            columns = {
                row[1] for row in connection.execute('PRAGMA table_info("projects")')
            }
            if not {"id", "name"}.issubset(columns):
                raise sqlite3.DatabaseError(
                    'Cannot migrate legacy "projects" table: expected id and name columns'
                )

            old_projects = connection.execute(
                'SELECT id, name FROM "projects" ORDER BY id'
            ).fetchall()
            for project_id, name in old_projects:
                connection.execute(
                    'INSERT INTO "Project" '
                    "(ProjectID, OwnerID, Description) VALUES (?, ?, ?)",
                    (project_id, owner_id, name),
                )
                project_owner_id = connection.execute(
                    'SELECT OwnerID FROM "Project" WHERE ProjectID = ?',
                    (project_id,),
                ).fetchone()[0]
                connection.execute(
                    'INSERT OR IGNORE INTO "Collaborators" (ProjectID, UserID) '
                    "VALUES (?, ?)",
                    (project_id, project_owner_id),
                )
            connection.execute('DROP TABLE "projects"')


class ProjectRequestHandler(BaseHTTPRequestHandler):
    def send_json(self, status_code, data):
        body = json.dumps(data).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        path = urlsplit(self.path).path
        if path != "/api/projects":
            match = re.fullmatch(r"/api/projects/([1-9][0-9]*)/nodes", path)
            if match:
                self.get_nodes(int(match.group(1)))
                return
            self.send_json(404, {"error": "Not found"})
            return

        try:
            with connect_database() as connection:
                rows = connection.execute(
                    'SELECT ProjectID, COALESCE(NULLIF(Description, \'\'), '
                    "'Project ' || ProjectID) FROM \"Project\" ORDER BY ProjectID"
                ).fetchall()
            self.send_json(200, [{"id": row[0], "name": row[1]} for row in rows])
        except sqlite3.Error:
            logging.exception("Could not load projects")
            self.send_json(500, {"error": "Could not load projects"})

    def get_nodes(self, project_id):
        try:
            with connect_database() as connection:
                project = connection.execute(
                    'SELECT 1 FROM "Project" WHERE ProjectID = ?', (project_id,)
                ).fetchone()
                if project is None:
                    self.send_json(404, {"error": "Project not found"})
                    return

                rows = connection.execute(
                    'SELECT TaskID, Title, Description, Deadline, NodeType, Progress, ParentID '
                    'FROM "Node" WHERE ProjectID = ? ORDER BY TaskID',
                    (project_id,),
                ).fetchall()
            self.send_json(
                200,
                [
                    {
                        "id": row[0],
                        "title": row[1],
                        "description": row[2],
                        "deadline": row[3],
                        "nodeType": row[4],
                        "progress": row[5],
                        "parentId": row[6],
                    }
                    for row in rows
                ],
            )
        except sqlite3.Error:
            logging.exception("Could not load nodes for project %s", project_id)
            self.send_json(500, {"error": "Could not load nodes"})

    def do_POST(self):
        path = urlsplit(self.path).path
        if path != "/api/projects":
            match = re.fullmatch(r"/api/projects/([1-9][0-9]*)/nodes", path)
            if match:
                self.create_node(int(match.group(1)))
                return
            self.send_json(404, {"error": "Not found"})
            return

        try:
            with connect_database() as connection:
                owner_id = connection.execute(
                    'SELECT UserID FROM "User" WHERE Email = ?',
                    (DEMO_OWNER_EMAIL,),
                ).fetchone()[0]
                cursor = connection.execute(
                    'INSERT INTO "Project" (OwnerID) VALUES (?)', (owner_id,)
                )
                project_id = cursor.lastrowid
                connection.execute(
                    'INSERT INTO "Collaborators" (ProjectID, UserID) VALUES (?, ?)',
                    (project_id, owner_id),
                )
                project = {"id": project_id, "name": f"Project {project_id}"}
            self.send_json(201, project)
        except sqlite3.Error:
            logging.exception("Could not create project")
            self.send_json(500, {"error": "Could not create project"})

    def create_node(self, project_id):
        try:
            content_length = int(self.headers.get("Content-Length", "0"))
            if content_length <= 0 or content_length > 65536:
                self.send_json(400, {"error": "Request body must be between 1 and 65536 bytes"})
                return
            payload = json.loads(self.rfile.read(content_length))
        except (ValueError, UnicodeDecodeError):
            self.send_json(400, {"error": "Request body must be valid JSON"})
            return

        if not isinstance(payload, dict):
            self.send_json(400, {"error": "Request body must be a JSON object"})
            return

        title = payload.get("title")
        description = payload.get("description", "")
        deadline = payload.get("deadline")
        node_type = payload.get("nodeType", "Task")
        progress = payload.get("progress", "Not Started")
        parent_id = payload.get("parentId")

        if not isinstance(title, str) or not title.strip() or len(title.strip()) > 255:
            self.send_json(400, {"error": "Title must be between 1 and 255 characters"})
            return
        if description is not None and not isinstance(description, str):
            self.send_json(400, {"error": "Description must be text"})
            return
        if not isinstance(deadline, str):
            self.send_json(400, {"error": "A valid deadline is required"})
            return
        try:
            datetime.fromisoformat(deadline)
        except ValueError:
            self.send_json(400, {"error": "A valid deadline is required"})
            return
        if not isinstance(node_type, str) or node_type not in {
            "Task",
            "Document",
            "Test",
        }:
            self.send_json(400, {"error": "Node type must be Task, Document, or Test"})
            return
        if not isinstance(progress, str) or progress not in {
            "Not Started",
            "In Progress",
            "Finished",
        }:
            self.send_json(400, {"error": "Invalid progress value"})
            return
        if parent_id is not None and (
            isinstance(parent_id, bool) or not isinstance(parent_id, int) or parent_id <= 0
        ):
            self.send_json(400, {"error": "Parent node must be a valid node ID"})
            return

        try:
            with connect_database() as connection:
                if connection.execute(
                    'SELECT 1 FROM "Project" WHERE ProjectID = ?', (project_id,)
                ).fetchone() is None:
                    self.send_json(404, {"error": "Project not found"})
                    return

                if parent_id is not None and connection.execute(
                    'SELECT 1 FROM "Node" WHERE ProjectID = ? AND TaskID = ?',
                    (project_id, parent_id),
                ).fetchone() is None:
                    self.send_json(400, {"error": "Parent node must belong to this project"})
                    return

                normalized_description = (
                    description.strip() or None if description else None
                )
                cursor = connection.execute(
                    'INSERT INTO "Node" '
                    "(ProjectID, ParentID, Title, Description, Deadline, NodeType, Progress) "
                    "VALUES (?, ?, ?, ?, ?, ?, ?)",
                    (
                        project_id,
                        parent_id,
                        title.strip(),
                        normalized_description,
                        deadline,
                        node_type,
                        progress,
                    ),
                )
                node = {
                    "id": cursor.lastrowid,
                    "title": title.strip(),
                    "description": normalized_description,
                    "deadline": deadline,
                    "nodeType": node_type,
                    "progress": progress,
                    "parentId": parent_id,
                }
            self.send_json(201, node)
        except sqlite3.Error:
            logging.exception("Could not create node for project %s", project_id)
            self.send_json(500, {"error": "Could not create node"})


if __name__ == "__main__":
    initialize_database()
    server = ThreadingHTTPServer(("127.0.0.1", 8000), ProjectRequestHandler)
    print("Python project API listening on http://127.0.0.1:8000")
    server.serve_forever()
