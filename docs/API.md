# API List

## Scenarios
User would create a project, add nodes to it.
When a project is created, a starting node is created automatically (representing the project in node space).
When creating a node, usually we start from an existing node. Say we want to make a bottle. Assuming that we have a "bottle" node, to further spread out the work, we create "bottle cap" and "bottle body" nodes under "bottle". 
When deleting a node, we inherently delete all nodes below it.
When updating a node, we prompt user to modify node specific info.

## Current
/api/projects/
__GET__: return projects with (id, name, created )
__POST__: create a project with logged in user, create collab with project and logged in user. Return project (id, name)

/api/projects/<proj id>
__GET__: return project (id, name) of proj id

/api/projects/<proj id>/nodes
__GET__: Return nodes (id, title, description, dealine, nodeType, progress, parentID) with proj id

<create_node>
__POST__: create a node, check that the parent node belongs to the same specified project. return node (id, title, description, deadline, nodeType, progress, parentId)

Backend server at 8000


## Deisigned

Project
- GET projects
- CREATE a project
- UPDATE a project
- DELETE a project

Node
- GET all Nodes of a project
- CREATE a Node
- UPDATE a Node
- ~~DELETE a Node

Relationship
- GET all relationships of a project
- CREATE a relationship
- UPDATE a relationship
- ~~DELETE a relationship

~~Comment
- ~~GET all comments of a task
- ~~GET a comment
- ~~CREATE a comment
- ~~UPDATE a comment
- ~~DELETE a comment

~~User
- ~~GET a user
- ~~CREATE a user
- ~~UPDATE a user
- ~~DELETE a user

~~Collaboration
- ~~CREATE a collab
- ~~DELETE a collab
- ~~UPDATE a collab
- ~~GET all collab of a project

