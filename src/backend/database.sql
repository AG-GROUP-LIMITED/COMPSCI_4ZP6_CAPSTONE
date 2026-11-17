CREATE TABLE IF NOT EXISTS "User" (
    UserID INTEGER PRIMARY KEY AUTOINCREMENT,
    Name TEXT NOT NULL,
    Email TEXT NOT NULL UNIQUE,
    PasswordHash TEXT NOT NULL
)

CREATE TABLE IF NOT EXISTS "Project" (
    ProjectID INTEGER PRIMARY KEY AUTOINCREMENT,
    OwnerID INTEGER NOT NULL REFERENCES "User" (UserID),
    Created TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Title TEXT NOT NULL,
    Description TEXT NOT NULL
)

CREATE TABLE IF NOT EXISTS "ProjectCollaborator" (
    ProjectID INTEGER NOT NULL,
    UserID INTEGER NOT NULL,
    PRIMARY KEY (ProjectID, UserID),
    FOREIGN KEY (ProjectID) REFERENCES "Project" (ProjectID),
    FOREIGN KEY (UserID) REFERENCES "User" (UserID)
)

CREATE TABLE IF NOT EXISTS "Node" (
    NodeID INTEGER NOT NULL,
    ProjectID INTEGER NOT NULL,
    Title TEXT NOT NULL,
    Description TEXT,
    Created TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    LastUpdated TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Deadline TEXT NOT NULL,
    NodeType TEXT NOT NULL DEFAULT 'Task' CHECK (
        NodeType IN ('Task', 'Document', 'Test')
    ),
    Progress TEXT NOT NULL DEFAULT 'Not Started' CHECK (
        Progress IN (
            'Not Started',
            'In Progress',
            'Finished'
        )
    ),
    AssigneeID INTEGER,
    x FLOAT NOT NULL,
    y FLOAT NOT NULL,
    PRIMARY KEY (NodeID, ProjectID),
    FOREIGN KEY (ProjectID) REFERENCES "Project" (ProjectID),
    FOREIGN KEY (ProjectID, AssigneeID) REFERENCES "ProjectCollaborator" (ProjectID, UserID)
)

CREATE TABLE IF NOT EXISTS "Comments" (
    CommentID INTEGER NOT NULL,
    NodeID INTEGER NOT NULL,
    ProjectID INTEGER NOT NULL,
    UserID INTEGER NOT NULL,
    Comment TEXT NOT NULL,
    PRIMARY KEY (CommentID, NodeID, ProjectID),
    FOREIGN KEY (NodeID, ProjectID) REFERENCES "Node" (NodeID, ProjectID),
    FOREIGN KEY (ProjectID, UserID) REFERENCES "ProjectCollaborator" (ProjectID, UserID)
)

CREATE TABLE IF NOT EXISTS "Edge" (
    EdgeID INTEGER NOT NULL,
    ProjectID INTEGER NOT NULL,
    SourceNodeID INTEGER NOT NULL,
    TargetNodeID INTEGER NOT NULL,
    EdgeType TEXT NOT NULL DEFAULT 'ParentOf' CHECK (
        EdgeType IN ('FileReference', 'ParentOf')
    ),
    Created TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (EdgeID, ProjectID),
    FOREIGN KEY (SourceNodeID, ProjectID) REFERENCES "Node" (NodeID, ProjectID),
    FOREIGN KEY (TargetNodeID, ProjectID) REFERENCES "Node" (NodeID, ProjectID)
)