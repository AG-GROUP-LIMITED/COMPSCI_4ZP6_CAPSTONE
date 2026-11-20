import React, { useState, useEffect, useCallback, useRef } from 'react'
import { SideBar, SideButton, SideMenu, SideSwitch } from './SideBar.tsx'
import { Network, Files, List, type LucideIcon } from 'lucide-react'
import TaskGraph from './Graph/TaskGraph.tsx'
import NodeList from './List/NodeList.tsx'
import { useNavigate, useOutletContext, useParams } from 'react-router'

type NodeType = "Task" | "Document" | "Test";
type EdgeType = "FileReference" | "ParentOf";
type Progress = "Not Started" | "In Progress" | "Finished";
type CreateNodeData = Omit<ProjectNode, "id">;
type CreateEdgeData = Omit<ProjectEdge, "id">;

//Temporary; for POC
type ApiNode = {
  nodeId: number;
  projectId: number;
  title: string;
  description: string | null;
  deadline: string;
  nodeType: NodeType;
  progress: Progress;
  x?: number;
  y?: number;
};

type ApiEdge = {
  edgeId: number;
  projectId: number;
  source: number;
  dest: number;
  edgeType: EdgeType;
};

type Project = {
  id: number;
  title: string;
};

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

interface LayoutContext {
  setPageTitle: (title: string) => void;
}

export function ProjectLayout() {
    const { setPageTitle } = useOutletContext<LayoutContext>();

    const [view, setView] = useState(false);
    const [isModalOpen, setModalOpen] = useState(false);

    const { id } = useParams();
    const selectedProjectId = id ? Number(id) : 0;
    const [project, setProject] = useState<Project | null>(null);

    const [nodes, setNodes] = useState<ProjectNode[]>([]);
    const [edges, setEdges] = useState<ProjectEdge[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isMutating, setIsMutating] = useState(false);

    const [selectedNode, setSelectedNode] = useState<ProjectNode | null>(null);

    const [isEditModalOpen, setEditModalOpen] = useState(false)
    const [isPromptModalOpen, setPromptModalOpen] = useState(false)
              
    const [error, setError] = useState<string | null>(null);

    const baseUrl = `/api/projects/${encodeURIComponent(selectedProjectId)}`;

    const loadProject = async () => {
      try {
        const response = await fetch(`/api/projects/${id}`);

        if (!response.ok) {
          throw new Error("Could not load project.");
        }

        const loadedProject: Project = await response.json();

        setProject(loadedProject);
      } catch (err) {
          setError(
              err instanceof Error
                  ? err.message
                  : "Could not load project."
          );
      }
    }

    const addNode = async (data: CreateNodeData): Promise<ProjectNode | null> => {
      if (!selectedProjectId) {
        setError("Select a project before adding a node");
        return null;
      };

      setIsMutating(true);
      setError(null);

      try {
        const nodeRes = await fetch(baseUrl + "/nodes", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify(data)
        });

        if (!nodeRes.ok) {
          throw new Error("Could not add node.");
        }

        // const newNode: ProjectNode = await nodeRes.json();
        const apiNode: ApiNode = await nodeRes.json();
        const newNode: ProjectNode = {
          id: apiNode.nodeId,
          title: apiNode.title,
          description: apiNode.description,
          deadline: apiNode.deadline,
          nodeType: apiNode.nodeType,
          progress: apiNode.progress,
          parentId: null,
        }

        setNodes(current => [...current, newNode]);

        if (data.parentId != null) {
          const edgeData: CreateEdgeData = {
            source: data.parentId,
            dest: newNode.id,
            edgeType: "ParentOf"
          };
          
          const edgeRes = await fetch(`${baseUrl}/edges`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(edgeData),
          });

          if (!edgeRes.ok) {
            throw new Error(
              "Node was created, but parent relationship could not be saved."
            );
          }

          // const newEdge: ProjectEdge = await edgeRes.json();
          const apiEdge: ApiEdge = await edgeRes.json();

          const newEdge: ProjectEdge = {
            id: apiEdge.edgeId,
            source: apiEdge.source,
            dest: apiEdge.dest,
            edgeType: apiEdge.edgeType,
          }
          setEdges(current => [...current, newEdge]);
        }

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

    const updateNode = async(nodeId: number, data: Omit<ProjectNode, "id" | "parentId">): Promise<boolean> => {
      setIsMutating(true);
      setError(null);

      try {
        const res = await fetch(
          `${baseUrl}/nodes/${nodeId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data)
          }
        );

        if (!res.ok) {
          throw new Error("Could not update node.");
        }

        // const updatedNode: ProjectNode = await res.json();

        setNodes(current => current.map(node => node.id === nodeId ? {...node, ...data} : node));

        setSelectedNode(current => current?.id === nodeId ? {...current, ...data} : current);

        return true;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Could not update node"
        );

        return false;
      } finally {
        setIsMutating(false);
      }
    };

    const refreshProject = useCallback(async () => {
      if (!selectedProjectId) {
        setNodes([]);
        setEdges([]);
        return;
      };

      setIsLoading(true);
      setError(null);

      try {
        const [nodeRes, edgeRes] = await Promise.all([
          fetch(`${baseUrl}/nodes`),
          fetch(`${baseUrl}/edges`)
        ]);
        const [apiNodes, apiEdges]: [ApiNode[], ApiEdge[]] = await Promise.all([
          nodeRes.json(),
          edgeRes.json()
        ])

        if (!nodeRes.ok) {
          throw new Error("Could not load nodes.");
        }

        if (!edgeRes.ok) {
          throw new Error("Could not load edges.");
        }

        // const [loadedNodes, loadedEdges]: [ProjectNode[], ProjectEdge[]] = await Promise.all([
        //   nodeRes.json(),
        //   edgeRes.json()
        // ]);
        const loadedNodes: ProjectNode[] = apiNodes.map(node => ({
          id: node.nodeId,
          title: node.title,
          description: node.description,
          deadline: node.deadline,
          nodeType: node.nodeType,
          progress: node.progress,
          parentId: null,
        }));

        const loadedEdges: ProjectEdge[] = apiEdges.map(edge => ({
          id: edge.edgeId,
          source: edge.source,
          dest: edge.dest,
          edgeType: edge.edgeType,
        }));

        setNodes(loadedNodes);
        setEdges(loadedEdges);
      } catch (err) {
        setError(
          err instanceof Error ? "here" + err.message : "Could not load project data."
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
    
    const handleOpenPromptModal = () => {
      setPromptModalOpen(true);
    }

    const handleClosePromptModal = () => {
      setPromptModalOpen(false);
    };

    const handleSubmitNode = async (data: CreateNodeData): Promise<boolean> => {
      const newNode = await addNode(data);
      return newNode !== null;
    };

    const handleNodeClick = (nodeId: number) => {
      const node = nodes.find(n => n.id === nodeId);

      if (!node) return;

      setSelectedNode(node);
      setEditModalOpen(true);
    };

    const handleCloseNodeDetails = () => {
      setEditModalOpen(false)
      setSelectedNode(null)
    };

    useEffect(() => {
      if (!id) return;

      void loadProject();
    }, [id]);

    useEffect(() => {
      setPageTitle(project?.title ?? "");

      return () => {
        setPageTitle("");
      };
    }, [project?.title, setPageTitle])

    useEffect(() => {
      void refreshProject();

      return () => {
        setPageTitle("");
      }
    }, [refreshProject, setPageTitle]);

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
                          onClick={handleOpenPromptModal}
                        >
                            Describe
                        </button>
                    ]
                }
            />
            <div className="flex flex-1 min-w-0 min-h-0 flex-col overflow-hidden p-2">
              {/* Error message */}
              {error && (
                  <div className="mb-3 rounded-md bg-red-100 p-3 text-red-700">
                      {error}
                  </div>
              )}
              <div className="min-h-0 flex-1 overflow-hidden">
                {isLoading 
                  ? (<p>Loading nodes...</p>) 
                  : view 
                    ? <NodeList nodes={nodes} onNodeClick={handleNodeClick}/>
                    : <TaskGraph projectId={selectedProjectId as number} projectNodes={nodes} projectEdges={edges} onNodeClick={handleNodeClick}/>}
              </div>
              <NodeFormModal
                  isOpen={isModalOpen}
                  onClose={handleCloseModal}
                  onSubmit={handleSubmitNode}
                  nodes={nodes}
                  isSubmitting={isMutating}
              />

              <NodeEditModal
              isOpen={isEditModalOpen}
              onClose={handleCloseNodeDetails}
              onSubmit={updateNode}
              node={selectedNode}
              nodes={nodes}
              isSubmitting={isMutating}
              />

              <PromptModel
              isOpen={isPromptModalOpen}
              onClose={handleClosePromptModal}
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
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e: PointerEvent) => {
      const target = e.target;

      if (
        target instanceof Node &&
        modalRef.current &&
        !modalRef.current.contains(target)
      ) {
        onClose();
      }
    };

    document.addEventListener("pointerdown", handleOutsideClick, true);

    return () => {
      document.removeEventListener("pointerdown", handleOutsideClick, true);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div ref={modalRef} className="bg-white h-min max-h-4/5 m-5 rounded-lg shadow-lg p-6 max-w-lg w-full flex flex-col relative overflow-hidden">
              <button className="absolute top-[25px] right-[25px] text-gray-500 hover:text-gray-700" onClick={onClose}>
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
            <h2 className="text-lg font-semibold">Create Node</h2>
            <form onSubmit={handleSubmit} className="flex-1 min-h-0 overflow-auto flex">
                <div className="flex-1 flex flex-col gap-2 min-h-full shrink-0">
                    <label className="block text-sm" htmlFor="titleInput">Title</label>
                    <input
                        className="w-full px-3 py-2
                                   border border-gray-300 rounded-lg"
                        id="titleInput"
                        type="text"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        maxLength={255}
                        required
                        placeholder="Node title"
                    />

                    <div className="flex flex-col gap-2">
                      <label className="block text-sm" htmlFor="descriptionInput">Description</label>
                      <textarea
                          className="w-full px-3 py-2
                                    border border-gray-300 rounded-lg resize-y min-h-10"
                          id="descriptionInput"
                          rows={3}
                          value={description}
                          onChange={e => setDescription(e.target.value)}
                          maxLength={255}
                          required
                          placeholder="Node description"
                      />
                    </div>

                    <label className="block text-sm" htmlFor="deadlineInput">Deadline</label>
                    <input
                        className="w-full px-3 py-2
                                   border border-gray-300 rounded-lg"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
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
                    <button
                    type="submit"
                    className="px-4 py-2 bg-green-500
                               text-white rounded-lg"
                    disabled={isSubmitting}
                    >
                        {isSubmitting ? "Saving..." : "Add Node"}
                    </button>
                </div>
                
            </form>
        </Modal>
    );
}

interface NodeEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    nodeId: number,
    data: Omit<ProjectNode, "id" | "parentId">
  ) => Promise<boolean>;
  node: ProjectNode | null;
  nodes: ProjectNode[];
  isSubmitting: boolean;
}

const NodeEditModal = ({isOpen, onClose, onSubmit, node, nodes, isSubmitting} : NodeEditModalProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [nodeType, setNodeType] =
    useState<NodeType>("Task");
  const [progress, setProgress] =
    useState<Progress>("Not Started");
  const [parentId, setParentId] = useState("");

  useEffect(() => {
    if (!isOpen || !node) return;

    setTitle(node.title);
    setDescription(node.description ?? "");
    setDeadline(node.deadline
      ? toDateTimeLocal(node.deadline)
      : ""
    );
    setNodeType(node.nodeType);
    setProgress(node.progress);
    setParentId(
      node.parentId != null
        ? String(node.parentId)
        : ""
    );

  }, [isOpen, node]);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!node || !title.trim()) return;

    const success = await onSubmit(node.id, {
      title: title.trim(),
      description: description.trim() || null,
      deadline: new Date(deadline).toISOString(),
      nodeType,
      progress,
    });

    if (success) {
      onClose();
    }
  };

  if (!node) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col gap-4 min-h-0">

        <div>
          <h2 className="text-lg font-semibold">
            Edit Node
          </h2>
          <p className="text-sm text-gray-500">
            Node ID: {node.id}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex-1 min-h-0 overflow-y-auto"
        >
          <div className="flex flex-col gap-3">

            {/* Title */}
            <div>
              <label htmlFor="editTitle" className="block text-sm mb-1">
                Title
              </label>

              <input
                id="editTitle"
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={title}
                onChange={e => setTitle(e.target.value)}
                maxLength={255}
                required
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="editDescription" className="block text-sm mb-1">
                Description
              </label>

              <textarea
                id="editDescription"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-y min-h-20"
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                maxLength={255}
              />
            </div>

            {/* Deadline */}
            <div>
              <label htmlFor="editDeadline" className="block text-sm mb-1">
                Deadline
              </label>

              <input
                id="editDeadline"
                type="datetime-local"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                required
              />
            </div>

            {/* Node Type */}
            <div>
              <label htmlFor="editNodeType" className="block text-sm mb-1">
                Node Type
              </label>

              <select
                id="editNodeType"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={nodeType}
                onChange={e =>
                  setNodeType(e.target.value as NodeType)
                }
              >
                <option value="Task">Task</option>
                <option value="Document">Document</option>
                <option value="Test">Test</option>
              </select>
            </div>

            {/* Progress */}
            <div>
              <label htmlFor="editProgress" className="block text-sm mb-1">
                Progress
              </label>

              <select
                id="editProgress"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={progress}
                onChange={e =>
                  setProgress(e.target.value as Progress)
                }
              >
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Finished">Finished</option>
              </select>
            </div>

            {/* Parent */}
            <div>
              <label htmlFor="editParent" className="block text-sm mb-1">
                Parent Node
              </label>

              <select
                id="editParent"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={parentId}
                onChange={e => setParentId(e.target.value)}
              >
                <option value="">No Parent</option>

                {nodes
                  .filter(n => n.id !== node.id)
                  .map(n => (
                    <option key={n.id} value={n.id}>
                      {n.title}
                    </option>
                  ))
                }
              </select>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </div>

          </div>
        </form>
      </div>
    </Modal>
  );
}

interface PromptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PromptModel = ({isOpen, onClose}: PromptModalProps) => {

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col gap-4 min-h-0">

        <div>
          <h2 className="text-lg font-semibold">
            Project Updates
          </h2>
        </div>

        <form
          className="flex-1 min-h-0 overflow-y-auto"
        >
          <div className="flex flex-col gap-3">

            {/* Title */}
            <div>
              <label htmlFor="editTitle" className="block text-sm mb-3">
                Describe your project updates:
              </label>

              <textarea
                id="editTitle"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder='e.g. "Jane now repointing Python jobs to Snowflake, not Kris"'
                maxLength={255}
                required
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {"Propose Changes"}
              </button>
            </div>

          </div>
        </form>
      </div>
    </Modal>
  );
}

const toDateTimeLocal = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const offset = date.getTimezoneOffset() * 60000;

  return new Date(date.getTime() - offset)
    .toISOString()
    .slice(0, 16);
};