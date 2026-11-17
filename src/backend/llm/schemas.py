from pydantic import BaseModel, ConfigDict

# TODO: get Node and Edge type dynamically from database schema

class Node(BaseModel):
    node_id: int
    type: str
    description: str | None
    progress: str | None
    assignee_id: int


class Edge(BaseModel):
    edge_id: int
    source_node_id: int
    target_node_id: int
    edge_type: str


class Comment(BaseModel):
    comment_id: int
    node_id: int
    user_id: int
    comment: str


class GraphState(BaseModel):
    model_config = ConfigDict(extra="forbid")  # No extra fields

    title: str | None
    description: str | None
    collaborators: list[str] = []
    nodes: list[Node] = []
    edges: list[Edge] = []
    comments: list[Comment] = []
