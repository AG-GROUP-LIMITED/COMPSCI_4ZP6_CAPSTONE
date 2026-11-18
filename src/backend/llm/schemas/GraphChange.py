from enum import Enum
from typing import Annotated, Literal
from pydantic import BaseModel, Field

class Confidence(Enum):
    HIGH = "HIGH"
    MED = "MED"
    LOW = "LOW"


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
    confidence: Confidence


class UpdateNode(BaseModel):
    operation: Literal["update_node"]
    node_id: int
    changes: NodeChanges
    confidence: Confidence


class DeleteNode(BaseModel):
    operation: Literal["delete_node"]
    node_id: int
    confidence: Confidence


class CreateEdge(BaseModel):
    operation: Literal["create_edge"]
    changes: EdgeChanges
    confidence: Confidence


class UpdateEdge(BaseModel):
    operation: Literal["update_edge"]
    edge_id: int
    changes: EdgeChanges
    confidence: Confidence


class DeleteEdge(BaseModel):
    operation: Literal["delete_edge"]
    edge_id: int
    confidence: Confidence


class Ambiguity(BaseModel):
    ambiguous_instruction: str
    clarification_needed: str


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
    ambiguities: list[Ambiguity]


# TODO: 
# add ambiguity class to GraphChange