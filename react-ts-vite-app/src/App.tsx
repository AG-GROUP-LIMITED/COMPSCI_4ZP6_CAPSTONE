import { useState } from 'react'
import './App.css'
import './index.css'
import { ProjectLayout } from './components/ProjectLayout.tsx'
import { MainLayout } from './components/MainLayout.tsx'
import { BrowserRouter, Routes, Route } from 'react-router'

function App() {
  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route path="project" element={<ProjectLayout />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
