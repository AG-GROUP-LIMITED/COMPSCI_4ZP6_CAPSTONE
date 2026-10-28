// import { useState } from 'react'
import './App.css'
import './index.css'

function App() {

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
        </div>
      </section>
    </>
  )
}

export default App
