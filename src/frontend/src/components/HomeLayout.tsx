import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { ProjectCard } from './Home/ProjectCard';

type Project = {
  id: number;
  title: string;
  created: Date;
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

            const sortedProjects = loadedProjects.sort(
              (a,b) => new Date(b.created).getTime() - new Date(a.created).getTime()
            );

            setProjects(sortedProjects);

            if (sortedProjects.length > 0) {
              setSelectedProjectId(String(sortedProjects[0].id));
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
                <div className="flex flex-col gap-5 w-3/5 justify-self-center justify-center py-10">
                  <h1 className="text-xl font-bold">My Projects</h1>
                  <ul className="grid grid-cols-2 gap-2 w-full">
                      {projects.map((project) => (
                        <ProjectCard project={project}></ProjectCard>
                      ))}
                  </ul>
                </div>
            </div>
        </>
    )
}