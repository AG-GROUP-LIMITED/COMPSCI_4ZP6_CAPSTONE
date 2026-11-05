import React from 'react'
import { NavBar, NavLeft, NavCenter, NavRight } from './Nav/NavBar.tsx'
import { SideBar, SideButton, SideMenu } from './SideBar.tsx'
import { Network, Files, List, type LucideIcon } from 'lucide-react'



interface LayoutProps {
    children: React.ReactNode;
    view: boolean;
    setView: React.Dispatch<React.SetStateAction<boolean>>
}

export function MainLayout({children, view, setView}: LayoutProps) {
    return (
        <div className="flex h-screen flex-col">
            <NavBar>
                <NavLeft>GRID</NavLeft>
                <NavCenter>PROJECT TITLE</NavCenter>
                <NavRight>SEARCH</NavRight>
            </NavBar>
            <div className="flex-1 flex flex-row">
                <SideBar>
                    <SideMenu icon={view ? List : Network} onclick={() => {setView((curr) => (!curr))}}>{view ? "List View" : "Graph View"}</SideMenu>
                    <SideMenu icon={Files} label="Documents" />
                </SideBar>
                <div className="flex-1 min-w-0 min-h-0 p-2">
                    {children}
                </div>
            </div>
        </div>
    );
};