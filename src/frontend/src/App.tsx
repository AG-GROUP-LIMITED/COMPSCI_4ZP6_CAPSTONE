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
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
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
