import { useEffect, useState } from 'react'
import './App.css'
import './index.css'

type Project = {
  id: number
  name: string
}

function App() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const response = await fetch('/api/projects')
        if (!response.ok) {
          throw new Error('Could not load projects.')
        }
        const loadedProjects: Project[] = await response.json()
        setProjects(loadedProjects)
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Could not load projects.')
      } finally {
        setIsLoading(false)
      }
    }

    void loadProjects()
  }, [])

  const createProject = async () => {
    setError(null)
    setIsCreating(true)

    try {
      const response = await fetch('/api/projects', { method: 'POST' })
      if (!response.ok) {
        throw new Error('Could not create project.')
      }
      const project: Project = await response.json()
      setProjects((currentProjects) => [...currentProjects, project])
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Could not create project.')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <>
      <nav className="flex border-b justify-between sticky top-0 px-3 h-1/25">
        <div>
          GRID
        </div>
        <div>
          Profile
        </div>
      </nav>
      <section className="flex flex-col justify-self-center mt-10 gap-6 w-1/2 h-24/25">
        <div className="w-full">
          <h1 className="justify-self-center">
            WORKSPACE
          </h1>
          search bar
        </div>
        <div className="w-full">
          <h2 className="justify-self-center">
            PROJECTS
          </h2>
          <button
            type="button"
            onClick={createProject}
            disabled={isLoading || isCreating}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isCreating ? 'Creating...' : 'Create project'}
          </button>
          {error && <p role="alert" className="mt-2 text-sm text-red-600">{error}</p>}
          {isLoading ? (
            <p className="mt-4 text-sm">Loading projects...</p>
          ) : (
            <ul className="mt-4 flex flex-col gap-2">
              {projects.map((project) => (
                <li key={project.id} className="rounded-md border p-3">
                  {project.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  )
}

export default App
