// import { useState } from 'react'
import './App.css'
import './index.css'
import { MainLayout } from './components/MainLayout.tsx'
import TaskGraph from './components/Graph/TaskGraph.tsx'

function App() {

  return (
    <>
      <MainLayout>
        <TaskGraph />
      </MainLayout>
    </>
  )
}

export default App
