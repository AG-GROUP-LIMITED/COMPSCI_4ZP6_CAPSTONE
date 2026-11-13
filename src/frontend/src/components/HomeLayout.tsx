import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'

type Project = {
  id: number;
  name: string;
};

export function HomeLayout() {
    const navigate = useNavigate();
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

    return(
        <>
            <div className="w-full">
                <div className="flex w-3/5 justify-self-center justify-center py-10">
                    <ul className="flex flex-col gap-2">
                        {projects.map((project) => (
                            <li key={`${project.id}`}>
                                <button onClick={() => navigate(`/projects/${project.id}`)}>
                                    {project.name}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </>
    )
}