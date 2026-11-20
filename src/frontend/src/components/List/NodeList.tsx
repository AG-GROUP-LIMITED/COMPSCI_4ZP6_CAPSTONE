type NodeType = "Task" | "Document" | "Test";
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

interface NodeListProps {
  nodes: ProjectNode[];
  onNodeClick: (nodeId: number) => void;
}

export default function NodeList({ nodes, onNodeClick }: NodeListProps) {
  if (nodes.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-gray-500">
        No tasks yet.
      </div>
    );
  }

  return (
    <div className="h-full min-h-0 overflow-y-auto">
      <table className="w-full text-left text-sm">
        <thead className="sticky top-0 bg-gray-100">
          <tr>
            <th className="px-4 py-3">Title</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Progress</th>
            <th className="px-4 py-3">Deadline</th>
          </tr>
        </thead>

        <tbody>
          {nodes.map((node) => (
            <tr
              key={node.id}
              onClick={() => onNodeClick(node.id)}
              className="cursor-pointer border-b hover:bg-gray-50"
            >
              <td className="px-4 py-3 font-medium">
                {node.title}
              </td>
              <td className="px-4 py-3">
                {node.nodeType}
              </td>
              <td className="px-4 py-3">
                {node.progress}
              </td>
              <td className="px-4 py-3">
                {node.deadline
                  ? new Date(node.deadline).toLocaleDateString()
                  : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}