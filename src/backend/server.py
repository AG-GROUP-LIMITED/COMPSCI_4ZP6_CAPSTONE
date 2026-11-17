import json
import logging
import re
import sqlite3
from contextlib import contextmanager
from datetime import datetime
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit

DATABASE = Path(__file__).with_name("projects.db")

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
    "Title TEXT NOT NULL, "
    "Description TEXT NOT NULL)",
    'CREATE TABLE IF NOT EXISTS "ProjectCollaborator" ('
    "ProjectID INTEGER NOT NULL, "
    "UserID INTEGER NOT NULL, "
    "PRIMARY KEY (ProjectID, UserID), "
    'FOREIGN KEY (ProjectID) REFERENCES "Project"(ProjectID), '
    'FOREIGN KEY (UserID) REFERENCES "User"(UserID))',
    'CREATE TABLE IF NOT EXISTS "Node" ('
    "NodeID INTEGER NOT NULL, "
    "ProjectID INTEGER NOT NULL, "
    "Title TEXT NOT NULL, "
    "Description TEXT, "
    "Created TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, "
    "LastUpdated TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, "
    "Deadline TEXT NOT NULL, "
    "NodeType TEXT NOT NULL DEFAULT 'Task' "
    "CHECK (NodeType IN ('Task', 'Document', 'Test')), "
    "Progress TEXT NOT NULL DEFAULT 'Not Started' "
    "CHECK (Progress IN ('Not Started', 'In Progress', 'Finished')), "
    "AssigneeID INTEGER, "
    "x FLOAT NOT NULL, "
    "y FLOAT NOT NULL, "
    "PRIMARY KEY (NodeID, ProjectID), "
    'FOREIGN KEY (ProjectID) REFERENCES "Project"(ProjectID), '
    'FOREIGN KEY (ProjectID, AssigneeID) '
    'REFERENCES "ProjectCollaborator"(ProjectID, UserID))',
    'CREATE TABLE IF NOT EXISTS "Comments" ('
    "CommentID INTEGER NOT NULL, "
    "NodeID INTEGER NOT NULL, "
    "ProjectID INTEGER NOT NULL, "
    "UserID INTEGER NOT NULL, "
    "Comment TEXT NOT NULL, "
    "PRIMARY KEY (CommentID, NodeID, ProjectID), "
    'FOREIGN KEY (NodeID, ProjectID) REFERENCES "Node"(NodeID, ProjectID), '
    'FOREIGN KEY (ProjectID, UserID) '
    'REFERENCES "ProjectCollaborator"(ProjectID, UserID))',
    'CREATE TABLE IF NOT EXISTS "Edge" ('
    "EdgeID INTEGER NOT NULL, "
    "ProjectID INTEGER NOT NULL, "
    "SourceNodeID INTEGER NOT NULL, "
    "TargetNodeID INTEGER NOT NULL, "
    "EdgeType TEXT NOT NULL DEFAULT 'ParentOf' "
    "CHECK (EdgeType IN ('FileReference', 'ParentOf')), "
    "Created TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, "
    "PRIMARY KEY (EdgeID, ProjectID), "
    'FOREIGN KEY (SourceNodeID, ProjectID) '
    'REFERENCES "Node"(NodeID, ProjectID), '
    'FOREIGN KEY (TargetNodeID, ProjectID) '
    'REFERENCES "Node"(NodeID, ProjectID))',
)


def insert_demo_data(connection):
    demo_project = connection.execute(
        'SELECT ProjectID FROM "Project" WHERE Title = ?',
        ("GRID Demo Project",),
    ).fetchone()
    if demo_project is not None:
        return

    users = (
        ("Kate Brown", "kate@example.com", "mock_hash_kate"),
        ("Bob Hamilton", "bob@example.com", "mock_hash_bob"),
        ("Charlie Smith", "charlie@example.com", "mock_hash_charlie"),
        ("Emma Jones", "emma@example.com", "mock_hash_emma"),
    )
    connection.executemany(
        'INSERT OR IGNORE INTO "User" (Name, Email, PasswordHash) '
        "VALUES (?, ?, ?)",
        users,
    )
    user_ids = {
        email: connection.execute(
            'SELECT UserID FROM "User" WHERE Email = ?',
            (email,),
        ).fetchone()[0]
        for _, email, _ in users
    }

    project_id = connection.execute(
        'INSERT INTO "Project" (OwnerID, Title, Description) '
        "VALUES (?, ?, ?)",
        (
            user_ids["kate@example.com"],
            "GRID Demo Project",
            "GRID demo project test data.",
        ),
    ).lastrowid
    connection.executemany(
        'INSERT INTO "ProjectCollaborator" (ProjectID, UserID) VALUES (?, ?)',
        [(project_id, user_id) for user_id in user_ids.values()],
    )

    nodes = (
        (1, "Project Setup", "Set up the initial project structure and repository.", "2026-12-01", "Task", "Finished", "kate@example.com", 100.0, 150.0),
        (2, "Design Database", "Create the initial database schema.", "2026-12-05", "Task", "In Progress", "bob@example.com", 400.0, 50.0),
        (3, "Design Frontend UI", "Create the initial graph visualization layout.", "2026-12-08", "Task", "In Progress", "charlie@example.com", 400.0, 350.0),
        (4, "Build Backend API", "Create basic backend endpoints.", "2026-12-12", "Task", "Not Started", "bob@example.com", 700.0, 50.0),
        (5, "Implement Graph View", "Display project nodes and relationships in the frontend graph.", "2026-12-15", "Task", "Not Started", "charlie@example.com", 700.0, 350.0),
        (6, "Integration Testing", "Test the basic workflow after frontend and backend integration.", "2026-12-19", "Test", "Not Started", "emma@example.com", 1000.0, 50.0),
        (7, "Requirements Document", "Maintain project requirements and supporting documentation.", "2026-12-10", "Document", "In Progress", "kate@example.com", 100.0, 550.0),
        (8, "Prepare Presentation", "Prepare the project demo presentation.", "2026-12-22", "Task", "Not Started", "kate@example.com", 100.0, 700.0),
    )
    connection.executemany(
        'INSERT INTO "Node" '
        "(NodeID, ProjectID, Title, Description, Deadline, NodeType, Progress, "
        "AssigneeID, x, y) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
            (
                node_id,
                project_id,
                title,
                description,
                deadline,
                node_type,
                progress,
                user_ids[assignee_email],
                x,
                y,
            )
            for (
                node_id,
                title,
                description,
                deadline,
                node_type,
                progress,
                assignee_email,
                x,
                y,
            ) in nodes
        ],
    )

    edges = (
        (1, 1, 2, "ParentOf"),
        (2, 1, 3, "ParentOf"),
        (3, 4, 7, "FileReference"),
        (4, 5, 7, "FileReference"),
    )
    connection.executemany(
        'INSERT INTO "Edge" '
        "(EdgeID, ProjectID, SourceNodeID, TargetNodeID, EdgeType) "
        "VALUES (?, ?, ?, ?, ?)",
        [(edge_id, project_id, source_id, target_id, edge_type) for edge_id, source_id, target_id, edge_type in edges],
    )

    comments = (
        (1, 1, "kate@example.com", "Initial project setup has been completed."),
        (2, 2, "bob@example.com", "Started working on the database design."),
        (3, 3, "charlie@example.com", "Created the first rough UI layout."),
    )
    connection.executemany(
        'INSERT INTO "Comments" (CommentID, NodeID, ProjectID, UserID, Comment) '
        "VALUES (?, ?, ?, ?, ?)",
        [
            (comment_id, node_id, project_id, user_ids[email], comment)
            for comment_id, node_id, email, comment in comments
        ],
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

        insert_demo_data(connection)

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
        if path == "/api/projects":
            try:
                with connect_database() as connection:
                    rows = connection.execute(
                        'SELECT ProjectID, Title, Description, Created '
                        'FROM "Project" ORDER BY ProjectID'
                    ).fetchall()
                self.send_json(
                    200, 
                    [
                        {
                            "id": row[0], 
                            "title": row[1], 
                            "description": row[2],
                            "created": row[3],
                        }
                        for row in rows
                    ]
                )
            except sqlite3.Error:
                logging.exception("Could not load projects")
                self.send_json(500, {"error": "Could not load projects"})

        match = re.fullmatch(
            r"/api/projects/([1-9][0-9]*)/nodes/([1-9][0-9]*)/comments",
            path,
        )
        if match:
            self.get_comments(int(match.group(1)), int(match.group(2)))
            return
        
        match = re.fullmatch(
            r"/api/projects/([1-9][0-9]*)/edges", 
            path
        )
        if match:
            self.get_edges(int(match.group(1)))
            return
        
        match = re.fullmatch(
            r"/api/projects/([1-9][0-9]*)/nodes", 
            path
        )
        if match:
            self.get_nodes(int(match.group(1)))
            return
        
        match = re.fullmatch(
            r"/api/projects/([1-9][0-9]*)", 
            path
        )
        if match:
            self.get_project(int(match.group(1)))
            return
        
        self.send_json(404, {"error": "Not found"})
        return
        

    def get_payload(self):
        try:
            content_length = int(self.headers.get("Content-Length", "0"))
            if content_length <= 0 or content_length > 65536:
                self.send_json(
                    400,
                    {"error": "Request body must be between 1 and 65536 bytes"},
                )
                return None
            payload = json.loads(self.rfile.read(content_length))
        except (ValueError, UnicodeDecodeError):
            self.send_json(400, {"error": "Request body must be valid JSON"})
            return None

        if not isinstance(payload, dict):
            self.send_json(400, {"error": "Request body must be a JSON object"})
            return None
        return payload

    def get_project(self, project_id):
        try:
            with connect_database() as connection:
                project = connection.execute(
                    'SELECT ProjectID, Title, Description FROM "Project" WHERE ProjectID = ?', (project_id,)
                ).fetchone()
                if project is None:
                    self.send_json(404, {"error": "Project not found"})
                    return
                
            self.send_json(
                200,
                {
                    "id": project[0],
                    "title": project[1],
                    "description": project[2],
                }
            )
        except sqlite3.Error:
            logging.exception("Could not load project %s", project_id)
            self.send_json(500, {"error": "Could not load project"})

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
                    'SELECT NodeID, Title, Description, Deadline, NodeType, Progress '
                    'FROM "Node" WHERE ProjectID = ? ORDER BY NodeID',
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
                    }
                    for row in rows
                ],
            )
        except sqlite3.Error:
            logging.exception("Could not load nodes for project %s", project_id)
            self.send_json(500, {"error": "Could not load nodes"})

    def get_edges(self, project_id):
        try:
            with connect_database() as connection:
                project = connection.execute(
                    'SELECT 1 FROM "Project" WHERE ProjectID = ?', (project_id,)
                ).fetchone()
                if project is None:
                    self.send_json(404, {"error": "Project not found"})
                    return

                rows = connection.execute(
                    'SELECT EdgeID, SourceNodeID, TargetNodeID, EdgeType '
                    'FROM "Edge" WHERE ProjectID = ? ORDER BY EdgeID',
                    (project_id,),
                ).fetchall()
            self.send_json(
                200,
                [
                    {
                        "id": row[0],
                        "source": row[1],
                        "dest": row[2],
                        "edgeType": row[3],
                    }
                    for row in rows
                ],
            )
        except sqlite3.Error:
            logging.exception("Could not load edges for project %s", project_id)
            self.send_json(500, {"error": "Could not load edges"})

    def get_comments(self, project_id, node_id):
        try:
            with connect_database() as connection:
                project = connection.execute(
                    'SELECT 1 FROM "Project" WHERE ProjectID = ?', (project_id,)
                ).fetchone()
                if project is None:
                    self.send_json(404, {"error": "Project not found"})
                    return

                node = connection.execute(
                    'SELECT 1 FROM "Node" WHERE ProjectID = ? AND NodeID = ?', (project_id, node_id,)
                ).fetchone()
                if node is None:
                    self.send_json(404, {"error": "Node not found"})
                    return

                rows = connection.execute(
                    'SELECT CommentID, UserID, Comment '
                    'FROM "Comments" WHERE ProjectID = ?  AND NodeID = ? ORDER BY CommentID',
                    (project_id, node_id),
                ).fetchall()
            self.send_json(
                200,
                [
                    {
                        "id": row[0],
                        "user": row[1],
                        "comment": row[2],
                    }
                    for row in rows
                ],
            )
        except sqlite3.Error:
            logging.exception("Could not load comments for project %s node %s", project_id, node_id)
            self.send_json(500, {"error": "Could not load comments"})


    def do_PUT(self):
        path = urlsplit(self.path).path
        match = re.fullmatch(
            r"/api/projects/([1-9][0-9]*)/nodes/([1-9][0-9]*)/position",
            path,
        )
        if match:
            self.update_node_position(int(match.group(1)), int(match.group(2)))
            return

        match = re.fullmatch(r"/api/projects/([1-9][0-9]*)", path)
        if match:
            self.update_project(int(match.group(1)))
            return

        match = re.fullmatch(
            r"/api/projects/([1-9][0-9]*)/nodes/([1-9][0-9]*)",
            path,
        )
        if match:
            self.update_node(int(match.group(1)), int(match.group(2)))
            return

        match = re.fullmatch(
            r"/api/projects/([1-9][0-9]*)/edges/([1-9][0-9]*)",
            path,
        )
        if match:
            self.update_edge(int(match.group(1)), int(match.group(2)))
            return

        match = re.fullmatch(
            r"/api/projects/([1-9][0-9]*)/nodes/([1-9][0-9]*)/comments/([1-9][0-9]*)",
            path,
        )
        if match:
            self.update_comment(
                int(match.group(1)),
                int(match.group(2)),
                int(match.group(3)),
            )
            return

        self.send_json(404, {"error": "Not found"})

    def update_node_position(self, project_id, node_id):
        payload = self.get_payload()
        if payload is None:
            return
        if set(payload) != {"x", "y"}:
            self.send_json(400, {"error": "Both x and y positions are required"})
            return

        try:
            with connect_database() as connection:
                result = connection.execute(
                    'UPDATE "Node" SET x = ?, y = ?, '
                    "LastUpdated = CURRENT_TIMESTAMP "
                    "WHERE ProjectID = ? AND NodeID = ?",
                    (payload.get("x"), payload.get("y"), project_id, node_id),
                )
                if result.rowcount == 0:
                    self.send_json(404, {"error": "Node not found"})
                    return
            self.send_json(
                200,
                {"id": node_id, "projectId": project_id, "x": payload.get("x"), "y": payload.get("y")},
            )
        except sqlite3.Error:
            logging.exception(
                "Could not update position for project %s node %s",
                project_id,
                node_id,
            )
            self.send_json(500, {"error": "Could not update node position"})

    def update_project(self, project_id):
        payload = self.get_payload()
        if payload is None:
            return
        if not payload:
            self.send_json(400, {"error": "Provide at least one field to update"})
            return

        allowed_fields = {"title": "Title", "description": "Description"}

        assignments = []
        values = []
        for field, value in payload.items():
            if field not in allowed_fields.keys():
                self.send_json(
                    400,
                    {"error": f"Field '{field}' is not allowed to be updated or doesn't exist"},
                )
                return
            assignments.append(f"{allowed_fields[field]} = ?")
            values.append(value)
        try:
            with connect_database() as connection:
                result = connection.execute(
                    f'UPDATE "Project" SET {", ".join(assignments)} '
                    "WHERE ProjectID = ?",
                    (*values, project_id),
                )
                if result.rowcount == 0:
                    self.send_json(404, {"error": "Project not found"})
                    return
            self.send_json(200, {"id": project_id, **payload})
        except sqlite3.Error:
            logging.exception("Could not update project %s", project_id)
            self.send_json(500, {"error": "Could not update project"})

    def update_node(self, project_id, node_id):
        payload = self.get_payload()
        if payload is None:
            return
        if not payload:
            self.send_json(400, {"error": "Provide at least one field to update"})
            return

        allowed_fields = {
            "title": "Title",
            "description": "Description",
            "deadline": "Deadline",
            "nodeType": "NodeType",
            "progress": "Progress",
            "assigneeId": "AssigneeID"
        }

        assignments = []
        values = []
        for field, value in payload.items():
            if field not in allowed_fields.keys():
                self.send_json(
                    400,
                    {"error": f"Field '{field}' is not allowed to be updated or doesn't exist"},
                )
                return
            assignments.append(f"{allowed_fields[field]} = ?")
            values.append(value)
        assignments.append("LastUpdated = CURRENT_TIMESTAMP")

        try:
            with connect_database() as connection:
                result = connection.execute(
                    f'UPDATE "Node" SET {", ".join(assignments)} '
                    "WHERE ProjectID = ? AND NodeID = ?",
                    (*values, project_id, node_id),
                )
                if result.rowcount == 0:
                    self.send_json(404, {"error": "Node not found"})
                    return
            self.send_json(
                200,
                {"id": node_id, "projectId": project_id, **payload},
            )
        except sqlite3.Error:
            logging.exception(
                "Could not update node %s in project %s",
                node_id,
                project_id,
            )
            self.send_json(500, {"error": "Could not update node"})

    def update_edge(self, project_id, edge_id):
        payload = self.get_payload()
        if payload is None:
            return
        if not payload:
            self.send_json(400, {"error": "Provide at least one field to update"})
            return

        allowed_fields = {
            "sourceNode": "SourceNodeID",
            "targetNode": "TargetNodeID",
            "edgeType": "EdgeType"
        }

        assignments = []
        values = []
        for field, value in payload.items():
            if field not in allowed_fields.keys():
                self.send_json(
                    400,
                    {"error": f"Field '{field}' is not allowed to be updated or doesn't exist"},
                )
                return
            assignments.append(f"{allowed_fields[field]} = ?")
            values.append(value)
        try:
            with connect_database() as connection:
                result = connection.execute(
                    f'UPDATE "Edge" SET {", ".join(assignments)} '
                    "WHERE ProjectID = ? AND EdgeID = ?",
                    (*values, project_id, edge_id),
                )
                if result.rowcount == 0:
                    self.send_json(404, {"error": "Edge not found"})
                    return
            self.send_json(
                200,
                {"id": edge_id, "projectId": project_id, **payload},
            )
        except sqlite3.Error:
            logging.exception(
                "Could not update edge %s in project %s",
                edge_id,
                project_id,
            )
            self.send_json(500, {"error": "Could not update edge"})

    def update_comment(self, project_id, node_id, comment_id):
        payload = self.get_payload()
        if payload is None:
            return
        if set(payload) != {"comment"}:
            self.send_json(400, {"error": "Only the comment field can be updated"})
            return

        try:
            with connect_database() as connection:
                result = connection.execute(
                    'UPDATE "Comments" SET Comment = ? '
                    "WHERE ProjectID = ? AND NodeID = ? AND CommentID = ?",
                    (payload.get("comment"), project_id, node_id, comment_id),
                )
                if result.rowcount == 0:
                    self.send_json(404, {"error": "Comment not found"})
                    return
            self.send_json(
                200,
                {
                    "id": comment_id,
                    "projectId": project_id,
                    "nodeId": node_id,
                    "comment": payload.get("comment"),
                },
            )
        except sqlite3.Error:
            logging.exception(
                "Could not update comment %s for project %s node %s",
                comment_id,
                project_id,
                node_id,
            )
            self.send_json(500, {"error": "Could not update comment"})

    def do_POST(self):
        path = urlsplit(self.path).path
        if path == "/api/projects":
            self.create_project()
            return
        match = re.fullmatch(r"/api/projects/([1-9][0-9]*)/nodes", path)
        if match:
            self.create_node(int(match.group(1)))
            return
        match = re.fullmatch(
            r"/api/projects/([1-9][0-9]*)/nodes/([1-9][0-9]*)/comments",
            path,
        )
        if match:
            self.create_comment(int(match.group(1)), int(match.group(2)))
            return
        match = re.fullmatch(r"/api/projects/([1-9][0-9]*)/edges", path)
        if match:
            self.create_edge(int(match.group(1)))
            return
        self.send_json(404, {"error": "Not found"})

    def create_project(self):
        payload = self.get_payload()
        if payload is None:
            return

        title = payload.get("title")
        description = payload.get("description")

        if not isinstance(title, str):
            self.send_json(400, {"error": "Valid title required"})
            return
        if not isinstance(description, str):
            self.send_json(400, {"error": "Valid description required"})
            return

        try:
            with connect_database() as connection:
                connection.execute("BEGIN IMMEDIATE")
                cursor = connection.execute(
                    'INSERT INTO "Project" '
                    "(Title, Description, OwnerID) "
                    "VALUES (?, ?, ?)",
                    (
                        title,
                        description,
                        1
                    ),
                )

                project = {
                    "id": cursor.lastrowid,
                    "title": title,
                    "description": description,
                    "owner": 1
                }
            self.send_json(201, project)
        except sqlite3.Error:
            logging.exception("Could not create project")
            self.send_json(500, {"error": "Could not create project"})

    def create_comment(self, project_id, node_id):
        payload = self.get_payload()
        if payload is None:
            return

        user_id = payload.get("userId")
        comment_text = payload.get("comment")

        if not isinstance(user_id, int):
            self.send_json(400, {"error": "Valid user id required"})
            return
        if not isinstance(comment_text, str):
            self.send_json(400, {"error": "Valid comment required"})
            return

        try:
            with connect_database() as connection:
                connection.execute("BEGIN IMMEDIATE")

                project = connection.execute(
                    'SELECT 1 FROM "Project" WHERE ProjectID = ?',
                    (project_id,),
                ).fetchone()
                if project is None:
                    self.send_json(404, {"error": "Project not found"})
                    return

                node = connection.execute(
                    'SELECT 1 FROM "Node" WHERE ProjectID = ? AND NodeID = ?',
                    (project_id, node_id),
                ).fetchone()
                if node is None:
                    self.send_json(404, {"error": "Node not found"})
                    return

                comment_id = connection.execute(
                    'SELECT COALESCE(MAX(CommentID), 0) + 1 FROM "Comments" '
                    'WHERE ProjectID = ? AND NodeID = ?',
                    (project_id, node_id),
                ).fetchone()[0]

                connection.execute(
                    'INSERT INTO "Comments" '
                    "(CommentID, NodeID, ProjectID, UserID, Comment) "
                    "VALUES (?, ?, ?, ?, ?)",
                    (comment_id, node_id, project_id, user_id, comment_text),
                )
                comment = {
                    "id": comment_id,
                    "user": user_id,
                    "comment": comment_text,
                }
            self.send_json(201, comment)
        except sqlite3.Error:
            logging.exception("Could not create comment for project %s node %s", project_id, node_id,)
            self.send_json(500, {"error": "Could not create comment"})

    def create_node(self, project_id):
        payload = self.get_payload()
        if payload is None:
            return

        title = payload.get("title")
        description = payload.get("description", "")
        deadline = payload.get("deadline")
        node_type = payload.get("nodeType", "Task")
        progress = payload.get("progress", "Not Started")
        x = payload.get("x", 0)
        y = payload.get("y", 0)

        if not isinstance(title, str):
            self.send_json(400, {"error": "Valid title required"})
            return
        if description is not None and not isinstance(description, str):
            self.send_json(400, {"error": "Valid description required"})
            return
        if not isinstance(deadline, str):
            self.send_json(400, {"error": "Valid deadline is required"})
            return
        try:
            datetime.fromisoformat(deadline)
        except ValueError:
            self.send_json(400, {"error": "Valid deadline is required"})
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

        try:
            with connect_database() as connection:
                connection.execute("BEGIN IMMEDIATE")
                if connection.execute(
                    'SELECT 1 FROM "Project" WHERE ProjectID = ?', (project_id,)
                ).fetchone() is None:
                    self.send_json(404, {"error": "Project not found"})
                    return

                node_id = connection.execute(
                    'SELECT COALESCE(MAX(NodeID), 0) + 1 FROM "Node" '
                    'WHERE ProjectID = ?',
                    (project_id,),
                ).fetchone()[0]
                connection.execute(
                    'INSERT INTO "Node" '
                    "(NodeID, ProjectID, Title, Description, Deadline, NodeType, "
                    "Progress, x, y) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    (
                        node_id,
                        project_id,
                        title,
                        description,
                        deadline,
                        node_type,
                        progress,
                        x,
                        y,
                    ),
                )

                node = {
                    "id": node_id,
                    "title": title,
                    "description": description,
                    "deadline": deadline,
                    "nodeType": node_type,
                    "progress": progress,
                }
            self.send_json(201, node)
        except sqlite3.Error:
            logging.exception("Could not create node for project %s", project_id)
            self.send_json(500, {"error": "Could not create node"})

    def create_edge(self, project_id):
        payload = self.get_payload()
        if payload is None:
            return

        source_node = payload.get("sourceNode")
        target_node = payload.get("targetNode")
        edge_type = payload.get("edge_type", "ParentOf")

        if not isinstance(edge_type, str) or edge_type not in {
            "Not Started",
            "In Progress",
            "Finished",
        }:
            self.send_json(400, {"error": "Invalid edge type value"})
            return

        try:
            with connect_database() as connection:
                connection.execute("BEGIN IMMEDIATE")

                if connection.execute(
                    'SELECT 1 FROM "Node" WHERE ProjectID = ? AND NodeID = ?',
                    (project_id, source_node),
                ).fetchone() is None:
                    self.send_json(404, {"error": "Source node not found"})
                    return

                if connection.execute(
                    'SELECT 1 FROM "Node" WHERE ProjectID = ? AND NodeID = ?',
                    (project_id, target_node),
                ).fetchone() is None:
                    self.send_json(404, {"error": "Target node not found"})
                    return

                edge_id = connection.execute(
                    'SELECT COALESCE(MAX(EdgeID), 0) + 1 FROM "Edge" '
                    'WHERE ProjectID = ?',
                    (project_id,),
                ).fetchone()[0]

                connection.execute(
                    'INSERT INTO "Edge" '
                    "(Title, Description, OwnerID) "
                    "VALUES (?, ?, ?)",
                    (
                        edge_id,
                        project_id,
                        source_node,
                        target_node,
                        edge_type,
                    ),
                )

                edge = {
                    "id": edge_id,
                    "projectId": project_id,
                    "source": source_node,
                    "dest": target_node,
                    "edgeType": edge_type,
                }
            self.send_json(201, edge)
        except sqlite3.Error:
            logging.exception(
                "Could not create edge for project %s from node %s to %s",
                project_id,
                source_node,
                target_node,
            )
            self.send_json(500, {"error": "Could not create edge"})


if __name__ == "__main__":
    initialize_database()
    server = ThreadingHTTPServer(("127.0.0.1", 8000), ProjectRequestHandler)
    print("Python project API listening on http://127.0.0.1:8000")
    server.serve_forever()
