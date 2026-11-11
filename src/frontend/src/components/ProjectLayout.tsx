import React, { useState, useEffect, useCallback } from 'react'
import { SideBar, SideButton, SideMenu, SideSwitch } from './SideBar.tsx'
import { Network, Files, List, type LucideIcon } from 'lucide-react'
import TaskGraph from './Graph/TaskGraph.tsx'
import { useNavigate, useParams } from 'react-router'

type NodeType = "Task" | "Document" | "Test";
type Progress = "Not Started" | "In Progress" | "Finished";
type CreateNodeData = Omit<ProjectNode, "id">;

type ProjectNode = {
  id: number;
  title: string;
  description: string | null;
  deadline: string;
  nodeType: NodeType;
  progress: Progress;
  parentId: number | null;
};

export function ProjectLayout() {
    const [view, setView] = useState(true);
    const [isModalOpen, setModalOpen] = useState(false);

    const { id } = useParams();
    const [selectedProjectId, setSelectedProjectId] = useState(id ?? 0);

    const [nodes, setNodes] = useState<ProjectNode[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isMutating, setIsMutating] = useState(false);

    const [error, setError] = useState<string | null>(null);

    const baseUrl = `/api/projects/${encodeURIComponent(selectedProjectId)}/nodes`;

    const addNode = async (data: CreateNodeData): Promise<ProjectNode | null> => {
      if (!selectedProjectId) {
        setError("Select a project before adding a node");
        return null;
      };

      setIsMutating(true);
      setError(null);

      try {
        const response = await fetch(baseUrl, {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify(data)
        });

        if (!response.ok) {
          throw new Error("Could not add node.");
        }

        const newNode: ProjectNode = await response.json();

        setNodes(current => [...current, newNode]);

        return newNode;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Could not add node."
        );

        return null;
      } finally {
        setIsMutating(false);
      }
    };

    const refreshNodes = useCallback(async () => {
      if (!selectedProjectId) {
        setNodes([]);
        return;
      };

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(baseUrl);

        if (!response.ok) {
          throw new Error("Could not load nodes.");
        }

        const loadedNodes: ProjectNode[] = await response.json();

        setNodes(loadedNodes);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Could not load nodes."
        );
      } finally {
        setIsLoading(false);
      }
    }, [selectedProjectId, baseUrl]);

    const handleSetView = () => {
        setView(current => !current);
    };

    const handleOpenAddModal = () => {
      setModalOpen(true);
    };

    const handleCloseModal = () => {
      setModalOpen(false);
    };

    const handleSubmitNode = async (data: CreateNodeData): Promise<boolean> => {
      const newNode = await addNode(data);
      return newNode !== null;
    };

    useEffect(() => {
      void refreshNodes();
    }, [refreshNodes]);

    return(
        <>
            <SideBar
                sidebarItems={
                    <>
                        <SideSwitch icon={view? Network : List} label={`${view? "Graph View" : "List View"}`} onclick={handleSetView}></SideSwitch>
                        <SideMenu icon={Files} label="Documents" />
                    </>
                }
                dropDownItems={
                    [
                        <button
                          type="button"
                          className="block px-4 py-2 text-gray-700 h-10 w-full text-left hover:bg-gray-100"
                          key="addNode"
                          onClick={handleOpenAddModal}
                        >
                            New Node
                        </button>,
                        <button
                          type="button"
                          className="block px-4 py-2 text-gray-700 h-10 w-full text-left hover:bg-gray-100"
                          key="otherButton"
                        >
                            TODO: Other functionality
                        </button>
                    ]
                }
            />
            <div className="flex-1 min-w-0 min-h-0 p-2">
              {/* Error message */}
              {error && (
                  <div className="mb-3 rounded-md bg-red-100 p-3 text-red-700">
                      {error}
                  </div>
              )}

              {isLoading ? (<p>Loading nodes...</p>) : view ? "TODO: implement list view" : <TaskGraph/>}
              <NodeFormModal
                  isOpen={isModalOpen}
                  onClose={handleCloseModal}
                  onSubmit={handleSubmitNode}
                  nodes={nodes}
                  isSubmitting={isMutating}
              />
            </div>   
        </>
    )
}

interface modalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

const Modal = ({ isOpen, onClose, children }: modalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full relative">
                <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onClick={onClose}>
                    &#x2715;
                </button>
                {children}
            </div>
        </div>
    );
};

interface NodeFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateNodeData) => Promise<boolean>;
    nodes: ProjectNode[];
    isSubmitting: boolean;
}

const NodeFormModal = ({isOpen, onClose, onSubmit, nodes, isSubmitting}: NodeFormModalProps) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [deadline, setDeadline] = useState("");
    const [nodeType, setNodeType] = useState<NodeType>("Task");
    const [progress, setProgress] = useState<Progress>("Not Started");
    const [parentId, setParentId] = useState("");

    useEffect(() => {
      if (!isOpen) return;

      setTitle("");
      setDescription("");
      setNodeType("Task");
      setProgress("Not Started");
      setParentId("");
    }, [isOpen]);

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!title.trim()) return;

      const success = await onSubmit({
        title: title.trim(),
        description: description.trim() || null,
        deadline,
        nodeType,
        progress,
        parentId : parentId ? Number(parentId) : null
      });

      if (success) {
        onClose();
      };
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <h2 className="text-lg font-bold">Create Node</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-sm" htmlFor="titleInput">Title</label>
                    <input
                        className="w-full px-3 py-2
                                   border rounded-lg"
                        id="titleInput"
                        type="text"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        maxLength={255}
                        required
                        placeholder="Node title"
                    />

                    <label className="block text-sm" htmlFor="descriptionInput">Description</label>
                    <textarea
                        className="w-full px-3 py-2
                                   border rounded-lg"
                        id="descriptionInput"
                        rows={3}
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        maxLength={255}
                        required
                        placeholder="Node description"
                    />

                    <label className="block text-sm" htmlFor="deadlineInput">Deadline</label>
                    <input
                        className="w-full px-3 py-2
                                   border rounded-lg"
                        id="deadlineInput"
                        type="datetime-local"
                        value={deadline}
                        onChange={e => setDeadline(e.target.value)}
                        maxLength={255}
                        required
                        // placeholder="Node description"
                    />

                    <label className="block text-sm" htmlFor="nodetypeInput">Node Type</label>
                    <select
                      className="w-full px-3 py-2 border rounded-lg"
                      id="nodetypeInput"
                      value={nodeType}
                      onChange={e => setNodeType(e.target.value as NodeType)}
                      // placeholder="Node description"
                    >
                      <option value="Task">Task</option>
                      <option value="Document">Document</option>
                      <option value="Test">Test</option>
                    </select>

                    <label className="block text-sm" htmlFor="progressInput">Progress</label>
                    <select
                      className="w-full px-3 py-2 border rounded-lg"
                      id="progressInput"
                      value={progress}
                      onChange={e => setProgress(e.target.value as Progress)}
                      // placeholder="Node description"
                    >
                      <option value="Not Started">Not Started</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Finished">Finished</option>
                    </select>

                    <label className="block text-sm" htmlFor="parentInput">Parent Node</label>
                    <select
                      className="w-full px-3 py-2 border rounded-lg"
                      id="parentInput"
                      value={parentId}
                      onChange={e => setParentId(e.target.value)}
                      // placeholder="Node description"
                    >
                      <option value="">No Parent</option>
                      {nodes.map(node => (
                        <option key={node.id} value={node.id}>
                          {node.title}
                        </option>
                      ))}
                    </select>
                </div>
                {/* <div className="mb-4">
                    <label className="block text-sm">Email</label>
                    <input
                        className="w-full px-3
                                   py-2 border rounded-lg"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div> */}
                <button
                    type="submit"
                    className="px-4 py-2 bg-green-500
                               text-white rounded-lg"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Saving..." : "Add Node"}
                </button>
            </form>
        </Modal>
    );
}


{/* <form onSubmit={addNode} className="mt-3 flex flex-col gap-4">
            <label className="flex flex-col gap-1 text-sm font-medium">
              Title
              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={255}
                required
                className="rounded-md border px-3 py-2 font-normal"
                placeholder="Node title"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium">
              Description
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={3}
                className="rounded-md border px-3 py-2 font-normal"
                placeholder="Optional details"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium">
              Deadline
              <input
                type="datetime-local"
                value={deadline}
                onChange={(event) => setDeadline(event.target.value)}
                required
                className="rounded-md border px-3 py-2 font-normal"
              />
            </label>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm font-medium">
                Node type
                <select
                  value={nodeType}
                  onChange={(event) =>
                    setNodeType(event.target.value as NodeType)
                  }
                  className="rounded-md border px-3 py-2 font-normal"
                >
                  <option value="Task">Task</option>
                  <option value="Document">Document</option>
                  <option value="Test">Test</option>
                </select>
              </label>
              <label className="flex flex-col gap-1 text-sm font-medium">
                Progress
                <select
                  value={progress}
                  onChange={(event) =>
                    setProgress(event.target.value as Progress)
                  }
                  className="rounded-md border px-3 py-2 font-normal"
                >
                  <option value="Not Started">Not Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Finished">Finished</option>
                </select>
              </label>
            </div>
            <label className="flex flex-col gap-1 text-sm font-medium">
              Parent node
              <select
                value={parentId}
                onChange={(event) => setParentId(event.target.value)}
                className="rounded-md border px-3 py-2 font-normal"
              >
                <option value="">No parent (top-level node)</option>
                {nodes.map((node) => (
                  <option key={node.id} value={node.id}>
                    {node.title}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              disabled={!selectedProjectId || isAddingNode || isLoadingNodes}
              className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
            >
              {isAddingNode ? "Adding node..." : "Add node"}
            </button>
          </form> */}