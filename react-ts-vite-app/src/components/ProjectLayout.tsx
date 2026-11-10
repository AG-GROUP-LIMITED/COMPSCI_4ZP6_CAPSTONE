import React, { useState } from 'react'
import { SideBar, SideButton, SideMenu, SideSwitch } from './SideBar.tsx'
import { Network, Files, List, type LucideIcon } from 'lucide-react'
import TaskGraph from './Graph/TaskGraph.tsx'

export function ProjectLayout() {
    const [view, setView] = useState(true);

    const handleSetView = () => {
        setView(!view)
    }

    return(
        <>
            <SideBar>
                <SideSwitch icon={view? Network : List} label={`${view? "Graph View" : "List View"}`} onclick={handleSetView}></SideSwitch>
                <SideMenu icon={Files} label="Documents" />
            </SideBar>
            <div className="flex-1 min-w-0 min-h-0 p-2">
                {view ? "TODO: implement list view" : <TaskGraph/>}
            </div>   
        </>
    )
}