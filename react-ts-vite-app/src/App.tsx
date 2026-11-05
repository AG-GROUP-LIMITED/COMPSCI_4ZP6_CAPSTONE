import { useState } from 'react'
import './App.css'
import './index.css'
import { MainLayout } from './components/MainLayout.tsx'
import TaskGraph from './components/Graph/TaskGraph.tsx'

function App() {
  const [view, setView] = useState<boolean>(true)

  return (
    <>
      <MainLayout>
        <TaskGraph />
      </MainLayout>
    </>
  )
}

export default App
