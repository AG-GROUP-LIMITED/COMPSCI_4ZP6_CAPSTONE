import { type FormEvent, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from 'react-router'
import "./App.css";
import "./index.css";
import { ProjectLayout } from './components/ProjectLayout.tsx'
import { MainLayout } from './components/MainLayout.tsx'
import { HomeLayout } from './components/HomeLayout.tsx'

type Project = {
  id: number;
  name: string;
};

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

function App() {
  // Sets default variables
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [nodes, setNodes] = useState<ProjectNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoadingNodes, setIsLoadingNodes] = useState(false);
  const [isAddingNode, setIsAddingNode] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [nodeType, setNodeType] = useState<NodeType>("Task");
  const [progress, setProgress] = useState<Progress>("Not Started");
  const [parentId, setParentId] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Function Code
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const response = await fetch("/api/projects");
        if (!response.ok) {
          throw new Error("Could not load projects.");
        }
        const loadedProjects: Project[] = await response.json();
        setProjects(loadedProjects);
        if (loadedProjects.length > 0) {
          setSelectedProjectId(String(loadedProjects[0].id));
        }
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Could not load projects.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadProjects();
  }, []);

  const createProject = async () => {
    setError(null);
    setIsCreating(true);

    try {
      const response = await fetch("/api/projects", { method: "POST" });
      if (!response.ok) {
        throw new Error("Could not create project.");
      }
      const project: Project = await response.json();
      setProjects((currentProjects) => [...currentProjects, project]);
      setSelectedProjectId(String(project.id));
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : "Could not create project.",
      );
    } finally {
      setIsCreating(false);
    }
  };

  // HTML Code for Website
  return (
    <>
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route path="home" element={<HomeLayout />} />
          <Route path="projects/:id" element={<ProjectLayout />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </>
  );
}

export default App;

{/* <nav className="flex border-b justify-between sticky top-0 px-3 h-1/25">
        <div>GRID</div>
        <div>Profile</div>
      </nav>
      <section className="flex flex-col justify-self-center mt-10 gap-6 w-1/2 h-24/25">
        <div className="w-full">
          <h1 className="justify-self-center">WORKSPACE</h1>
        </div>
        <div className="w-full">
          <h2 className="justify-self-center">PROJECTS</h2>
          <label
            htmlFor="project-select"
            className="mt-4 block text-sm font-medium"
          >
            Selected project
          </label>
          <select
            id="project-select"
            value={selectedProjectId}
            onChange={(event) => setSelectedProjectId(event.target.value)}
            disabled={isLoading || projects.length === 0}
            className="mt-1 w-full rounded-md border px-3 py-2"
          >
            <option value="" disabled>
              Select a project
            </option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={createProject}
            disabled={isLoading || isCreating}
            className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
          >
            {isCreating ? "Creating..." : "Create project"}
          </button>
          <h3 className="mt-8 text-lg font-semibold">Add a node</h3>
          <form onSubmit={addNode} className="mt-3 flex flex-col gap-4">
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
          </form>
          {error && (
            <p role="alert" className="mt-2 text-sm text-red-600">
              {error}
            </p>
          )}
          <h3 className="mt-8 text-lg font-semibold">Nodes</h3>
          {isLoadingNodes ? (
            <p className="mt-2 text-sm">Loading nodes...</p>
          ) : (
            <ul className="mt-3 flex flex-col gap-2">
              {nodes.map((node) => (
                <li key={node.id} className="rounded-md border p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <strong>{node.title}</strong>
                    <span className="text-sm">
                      {node.nodeType} · {node.progress}
                    </span>
                  </div>
                  {node.description && (
                    <p className="mt-1 text-sm">{node.description}</p>
                  )}
                  <p className="mt-1 text-xs">
                    Deadline: {node.deadline.replace("T", " ")}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section> */}