from pydantic import BaseModel

# TODO: get Node and Edge type dynamically from database schema

class Node(BaseModel):
    node_id: int
    type: str
    description: str
    progress: str
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
    title: str
    description: str
    collaborators: list[str]
    nodes: list[Node]
    edges: list[Edge]
    comments: list[Comment]
