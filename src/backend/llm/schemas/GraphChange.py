from typing import Annotated, Literal
from pydantic import BaseModel, Field


class NodeChanges(BaseModel):
    type: str | None
    title: str | None
    description: str | None
    progress: str | None
    assignee_id: int | None


class UpdateNode(BaseModel):
    operation: Literal["update_node"]
    node_id: int
    changes: NodeChanges


class CreateNode(BaseModel):
    operation: Literal["create_node"]
    changes: NodeChanges

# TODO: DeleteNode, CreateEdge, UpdateEdge, DeleteEdge


GraphOperation = Annotated[
    UpdateNode 
    | CreateNode 
    # | DeleteNode 
    # | CreateEdge 
    # | UpdateEdge 
    # | DeleteEdge
    ,
    Field(discriminator="operation")
]


class GraphChange(BaseModel):
    operations: list[GraphOperation]
