from typing import Annotated, Literal
from pydantic import BaseModel, Field


class NodeChanges(BaseModel):
    type: str | None = None
    title: str | None = None
    description: str | None = None
    progress: str | None = None
    assignee_id: int | None = None


class EdgeChanges(BaseModel):
    source_node_id: int | None = None
    target_node_id: int | None = None
    edge_type: str | None = None


class CreateNode(BaseModel):
    operation: Literal["create_node"]
    changes: NodeChanges
    confidence: float = Field(ge=0.0, le=1.0)


class UpdateNode(BaseModel):
    operation: Literal["update_node"]
    node_id: int
    changes: NodeChanges
    confidence: float = Field(ge=0.0, le=1.0)


class DeleteNode(BaseModel):
    operation: Literal["delete_node"]
    node_id: int
    confidence: float = Field(ge=0.0, le=1.0)


class CreateEdge(BaseModel):
    operation: Literal["create_edge"]
    changes: EdgeChanges
    confidence: float = Field(ge=0.0, le=1.0)


class UpdateEdge(BaseModel):
    operation: Literal["update_edge"]
    edge_id: int
    changes: EdgeChanges
    confidence: float = Field(ge=0.0, le=1.0)


class DeleteEdge(BaseModel):
    operation: Literal["delete_edge"]
    edge_id: int
    confidence: float = Field(ge=0.0, le=1.0)


GraphOperation = Annotated[
    UpdateNode 
    | CreateNode 
    | DeleteNode 
    | CreateEdge 
    | UpdateEdge 
    | DeleteEdge
    ,
    Field(discriminator="operation")
]


class GraphChange(BaseModel):
    operations: list[GraphOperation]


# TODO: 
# add ambiguity class to GraphChange