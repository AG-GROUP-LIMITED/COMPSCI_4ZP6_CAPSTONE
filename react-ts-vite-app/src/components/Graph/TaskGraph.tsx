
import { useCallback } from 'react';
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
    // TODO: GET /api/projects/{projectId}/graph/layout
    return null;
  }

const saveGraphLayout = 
  async (projectId: number, layout: GraphLayout): Promise<void> => {
    // TODO: PUT /api/projects/{projectId}/graph/layout
    console.log("Saving graph layout: ", projectId, layout)
  }
///////////////////////////////////////////////////////////////


const positions: Record<number, { x: number; y: number }> = {
  101: { x: 0, y: 150 },
  102: { x: 300, y: 0 },
  103: { x: 300, y: 300 },
  104: { x: 600, y: 0 },
  105: { x: 600, y: 300 },
  106: { x: 900, y: 0 },
  107: { x: 0, y: 450 },
  108: { x: 0, y: 600 },
};

const initialNodes: Node[] = tasks.map((task) => ({
  id: String(task.id),
  position: positions[task.id],
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
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

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
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}
