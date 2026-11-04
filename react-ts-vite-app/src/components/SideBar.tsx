import React, { useState } from 'react'
import {ChevronFirst, ChevronLast, Network, Files } from "lucide-react"
import SideButton from './SideButton'
import SideMenu from './SideMenu'

interface SideBarProps {
    children: React.ReactNode;
}

export function SideBar({children}: SideBarProps) {
    const [expanded, setExpanded] = useState(true)
    return (
        <aside className={`flex flex-col border-r border-r-gray-300 transition-all ${expanded? "w-60":"w-20"}`}>
            <div className="flex justify-end h-8 md:h-12 p-2 border-t-gray-300">
                <button onClick={()  => setExpanded((curr) => !curr)} className="rounded-md hover:bg-gray-100 transition-colors p-1.5 items-center">
                    {expanded ? <ChevronFirst/> : <ChevronLast/>}
                </button>
            </div>
            <div className="flex-1 p-2 justify-between">
                <SideMenu>
                    <Network/>
                    {expanded ? "View" : ""}
                </SideMenu>
                <SideMenu>
                    <Files/>
                    {expanded ? "Documents" : ""}
                </SideMenu>
            </div>
            <div className="h-8 md:h-12 p-2 border-t border-t-gray-300">
                <SideButton>
                    {expanded ? "Create New" : "+"}
                </SideButton>
            </div>
            {/* {children} */}
        </aside>
    );
};