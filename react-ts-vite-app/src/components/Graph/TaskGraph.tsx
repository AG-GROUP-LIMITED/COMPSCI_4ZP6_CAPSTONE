
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

type TaskStatus = 'Finished' | 'In Progress' | 'Not Started';
type TaskType = 'Task' | 'Test' | 'Document';

interface Task {
  id: number;
  parentId: number | null;
  title: string;
  description: string;
  dueDate: string;
  type: TaskType;
  status: TaskStatus;
  ownerId: number;
}

interface NodePosition {
  taskId: number;
  x: number;
  y: number;
}

interface GraphLayout {
  positions: NodePosition[];
}

const tasks: Task[] = [
  { id: 101, parentId: null, title: 'Project Setup', description: 'Set up the initial project structure and repository.', dueDate: '2026-11-04', type: 'Task', status: 'Finished', ownerId: 101 },
  { id: 102, parentId: 101, title: 'Design Database', description: 'Create the initial database schema.', dueDate: '2026-11-07', type: 'Task', status: 'In Progress', ownerId: 102 },
  { id: 103, parentId: 101, title: 'Design Frontend UI', description: 'Create the initial graph visualization layout.', dueDate: '2026-11-08', type: 'Task', status: 'In Progress', ownerId: 103 },
  { id: 104, parentId: 102, title: 'Build Backend API', description: 'Create basic backend endpoints.', dueDate: '2026-11-12', type: 'Task', status: 'Not Started', ownerId: 102 },
  { id: 105, parentId: 103, title: 'Implement Graph View', description: 'Display project nodes and parent relationships.', dueDate: '2026-11-13', type: 'Task', status: 'Not Started', ownerId: 103 },
  { id: 106, parentId: 104, title: 'Integration Testing', description: 'Test the basic workflow after integration.', dueDate: '2026-11-20', type: 'Test', status: 'Not Started', ownerId: 104 },
  { id: 107, parentId: null, title: 'Requirements Document', description: 'Maintain project requirements and supporting documentation.', dueDate: '2026-11-10', type: 'Document', status: 'In Progress', ownerId: 101 },
  { id: 108, parentId: null, title: 'Prepare Presentation', description: 'Prepare demo slides independently from the main task chain.', dueDate: '2026-11-22', type: 'Task', status: 'Not Started', ownerId: 101 },
];

const statusColors: Record<TaskStatus, string> = {
  Finished: '#16a34a',
  'In Progress': '#f59e0b',
  'Not Started': '#94a3b8',
};


///////////////////////////////////////////////////////////////
// Functions to load/persist graph layout
const getGraphLayout = 
  async (projectId: number): Promise<GraphLayout | null> => {
    console.log("Getting graph layout for project ID ", projectId)
    // TODO: implement GET /api/projects/{projectId}/graph/layout
    // TODO: replace below mock function with api response
    return mockGetGraphLayout(TEMP_HARDCODED_PROJECT_ID);
  }

const saveGraphLayout = 
  async (projectId: number, layout: GraphLayout): Promise<void> => {
    console.log("Saving graph layout: ", projectId, layout)
    // TODO: implement PUT /api/projects/{projectId}/graph/layout
  }

// Mock api call
const TEMP_HARDCODED_PROJECT_ID = 1;

// TODO: delete this function once this endpoint is implemented: GET /api/projects/{projectId}/graph/layout
const mockGetGraphLayout = async (projectId: number) => {
  console.log("mock GET graph layout for project ID: ", projectId)
  // add delay to mock load time
  await new Promise((resolve) => setTimeout(resolve, 500));
  // return node positions for that project ID
  return {
    positions: [
      { taskId: 101, x: 100, y: 150 },
      { taskId: 102, x: 400, y: 50 },
      { taskId: 103, x: 400, y: 350 },
      { taskId: 104, x: 700, y: 50 },
      { taskId: 105, x: 700, y: 350 },
      { taskId: 106, x: 1000, y: 50 },
      { taskId: 107, x: 100, y: 550 },
      { taskId: 108, x: 100, y: 700 },
    ]
  }
}
///////////////////////////////////////////////////////////////


const initialNodes: Node[] = tasks.map((task) => ({
  id: String(task.id),
  position: { x: 0, y: 0},  // fallback
  sourcePosition: Position.Right,
  targetPosition: Position.Left,
  data: {
    label: `${task.id} - ${task.title}`,
    ...task,
  },
  style: {
    width: 210,
    padding: 12,
    borderRadius: 8,
    border: `2px solid ${statusColors[task.status]}`,
    background: '#ffffff',
    color: '#111827',
    fontSize: 13,
  },
}));

const edgeStyle = {
  type: 'smoothstep',
  markerEnd: {
    type: MarkerType.ArrowClosed,
  },
  style: {
    stroke: '#64748b',
    strokeWidth: 2,
  },
};

const initialEdges: Edge[] = tasks
  .filter((task) => task.parentId !== null)
  .map((task) => ({
    id: `e-${task.parentId}-${task.id}`,
    source: String(task.parentId),
    target: String(task.id),
    ...edgeStyle,
  }));

export default function TaskGraph() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved node positions
  useEffect(() => {
    getGraphLayout(TEMP_HARDCODED_PROJECT_ID).then(
      (layout) => {
        if (!layout) return;
        setNodes((currentNodes) =>
          currentNodes.map((node) => {
            const saved = layout.positions.find(
              (p) => String(p.taskId) === node.id
            );
            return saved
              ? { ...node, position: { x: saved.x, y: saved.y } }
              : node;
          })
        );
        setIsLoading(false);
      }
    );
  }, [setNodes]);

  // Persist node positions after dragging
  const onNodeDragStop = useCallback(
    (_event: MouseEvent | TouchEvent, draggedNode: Node) => {
      const updatedNodes = nodes.map((node) =>
        node.id === draggedNode.id ? draggedNode : node
      );

      saveGraphLayout(TEMP_HARDCODED_PROJECT_ID, {
        positions: updatedNodes.map((node) => ({
          taskId: Number(node.id),
          x: node.position.x,
          y: node.position.y,
        })),
      });
    },
    [nodes]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      const newEdge: Edge = {
        ...connection,
        id: `e-${connection.source}-${connection.target}`,
        ...edgeStyle,
      };

      setEdges((currentEdges) =>
        addEdge(newEdge, currentEdges)
      );
    },
    [setEdges]
  );

  return (
    <div style={{ width: '100%', height: '100%'}}>
      {isLoading
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
