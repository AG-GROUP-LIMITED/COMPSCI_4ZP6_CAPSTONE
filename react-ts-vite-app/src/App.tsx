import { useState } from 'react'
import './App.css'
import './index.css'
import { MainLayout } from './components/MainLayout.tsx'

function App() {
  const [view, setView] = useState<boolean>(true)

  return (
    <>
      <MainLayout view={view} setView={setView}>
        {view ? ("graph") : ("list")}
      </MainLayout>
    </>
  )
}

export default App
