import { useCallback, useEffect, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Position,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
  type Node,
  type Edge,
  type Connection,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import {
  getGraphLayout,
  saveNodePosition,
} from './taskGraphApi';

type NodeType = "Task" | "Document" | "Test";
type EdgeType = "FileReference" | "ParentOf";
type Progress = "Not Started" | "In Progress" | "Finished";

type ProjectNode = {
  id: number;
  title: string;
  description: string | null;
  deadline: string;
  nodeType: NodeType;
  progress: Progress;
  parentId: number | null;
};

type ProjectEdge = {
  id: number;
  source: number;
  dest: number;
  edgeType: EdgeType
}

interface GraphProps {
  projectId: number;
  projectNodes: ProjectNode[];
  projectEdges: ProjectEdge[];
}

// TODO: replace this with GET api call
// const tasks: Task[] = [
//   { id: 101, parentId: null, title: 'Project Setup', description: 'Set up the initial project structure and repository.', dueDate: '2026-11-04', type: 'Task', status: 'Finished', ownerId: 101 },
//   { id: 102, parentId: 101, title: 'Design Database', description: 'Create the initial database schema.', dueDate: '2026-11-07', type: 'Task', status: 'In Progress', ownerId: 102 },
//   { id: 103, parentId: 101, title: 'Design Frontend UI', description: 'Create the initial graph visualization layout.', dueDate: '2026-11-08', type: 'Task', status: 'In Progress', ownerId: 103 },
//   { id: 104, parentId: 102, title: 'Build Backend API', description: 'Create basic backend endpoints.', dueDate: '2026-11-12', type: 'Task', status: 'Not Started', ownerId: 102 },
//   { id: 105, parentId: 103, title: 'Implement Graph View', description: 'Display project nodes and parent relationships.', dueDate: '2026-11-13', type: 'Task', status: 'Not Started', ownerId: 103 },
//   { id: 106, parentId: 104, title: 'Integration Testing', description: 'Test the basic workflow after integration.', dueDate: '2026-11-20', type: 'Test', status: 'Not Started', ownerId: 104 },
//   { id: 107, parentId: null, title: 'Requirements Document', description: 'Maintain project requirements and supporting documentation.', dueDate: '2026-11-10', type: 'Document', status: 'In Progress', ownerId: 101 },
//   { id: 108, parentId: null, title: 'Prepare Presentation', description: 'Prepare demo slides independently from the main task chain.', dueDate: '2026-11-22', type: 'Task', status: 'Not Started', ownerId: 101 },
// ];

const statusColors: Record<Progress, string> = {
  Finished: '#16a34a',
  'In Progress': '#f59e0b',
  'Not Started': '#94a3b8',
};

const edgeStyles: Record<EdgeType, Partial<Edge>> = {
  ParentOf: {
    type: 'smoothstep',
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
    style: {
      stroke: '#64748b',
      strokeWidth: 2,
    }
  },
  FileReference: {
    type: 'smoothstep',
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
    style: {
      stroke: '#3b82f6',
      strokeWidth: 2,
      strokeDasharray: '5 5',
    },
  },
};

export default function TaskGraph({projectId, projectNodes, projectEdges}: GraphProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [isLayoutLoading, setIsLayoutLoading] = useState(true);

  useEffect(() => {
    setNodes(currentNodes => {
      return projectNodes.map((node, index) => {
        const existing = currentNodes.find(
          node2 => node2.id === String(node.id)
        );

        return {
          id: String(node.id),
          position: existing?.position ?? {
            x: (index % 3) * 260,
            y: Math.floor(index / 3) * 160,
          },
          sourcePosition: Position.Right,
          targetPosition: Position.Left,
          data: {
            label: `${node.id} - ${node.title}`,
            ...node,
          },
          style: {
            width: 210,
            padding: 12,
            borderRadius: 8,
            border: `2px solid ${statusColors[node.progress]}`,
            background: '#ffffff',
            color: '#111827',
            fontSize: 13,
          },
        }
      })
    });

    setEdges(
      projectEdges.map(edge => ({
        id: String(edge.id),
        source: String(edge.source),
        target: String(edge.dest),
        ...edgeStyles[edge.edgeType],
        data: {
          edgeType: edge.edgeType,
        },
      }))
    );
  }, [projectNodes, projectEdges, setNodes, setEdges]);

  // Load saved node positions for this project.
  useEffect(() => {
    let cancelled = false;

    const loadLayout = async () => {
      setIsLayoutLoading(true);

      try {
        const layout = await getGraphLayout(projectId);

        if (cancelled || !layout) return;

        setNodes(currentNodes =>
          currentNodes.map(node => {
            const saved = layout.positions.find(
              p => String(p.taskId) === node.id
            );

            return saved
              ? {
                  ...node,
                  position: { x: saved.x, y: saved.y },
                }
              : node;
          })
        );

      } catch (err) {
        console.error('Could not load graph layout:', err);
      } finally {
        if (!cancelled) {
          setIsLayoutLoading(false);
        }
      }
    };

    void loadLayout();

    return () => {
      cancelled = true;
    };

  }, [projectId, setNodes]);

  // Persist node positions after dragging
  const onNodeDragStop = useCallback(
    (_: MouseEvent | TouchEvent, draggedNode: Node) => {
      void saveNodePosition(projectId, {
        taskId: Number(draggedNode.id),
        x: draggedNode.position.x,
        y: draggedNode.position.y,
      });
    },
    [projectId]
  )

  const onConnect = useCallback(async (connection: Connection) => {
    if (!connection.source || !connection.target) return;

    const source = Number(connection.source);
    const dest = Number(connection.target);

    if (!Number.isInteger(source) || !Number.isInteger(dest)) {
      console.error("Invalid node IDs for edge conneciton");
      return;
    }

    try {
      const response = await fetch(
        `/api/projects/${projectId}/edges`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            source,
            dest,
            edgeType: "ParentOf"
          }),
        }
      );

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(
          `Could not create edge (${response.status}): ${errorBody}`
        );
      }

      const savedEdge: ProjectEdge = await response.json();

      const newEdge: Edge = {
        id: String(savedEdge.id),
        source: String(savedEdge.source),
        target: String(savedEdge.dest),
        data: {
          edgeType: savedEdge.edgeType,
        },
        ...edgeStyles[savedEdge.edgeType],
      };

      setEdges(currentEdges => addEdge(newEdge, currentEdges));
    } catch (error) {
      console.error("Failed to create edge:", error);
    }
  }, [projectId, setEdges]);
  // const onConnect = useCallback(
  //   (connection: Connection) => {
  //     const newEdge: Edge = {
  //       ...connection,
  //       id: `temp-${connection.source}-${connection.target}`,
  //       type: 'smoothstep',
  //       ...edgeStyles['ParentOf'],
  //       data: {
  //         edgeType: 'ParentOf',
  //       },
  //     };

  //     setEdges(currentEdges => 
  //       addEdge(newEdge, currentEdges)
  //     );
  //   },
  //   [setEdges]
  // );

  return (
    <div style={{ width: '100%', height: '100%'}}>
      {isLayoutLoading
        ? (<div>Loading graph...</div>)
        : (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeDragStop={onNodeDragStop}
              onConnect={onConnect}
              fitView
            >
              <Background />
              <Controls />
              <MiniMap />
            </ReactFlow>
        )
      }
    </div>
  );
}
