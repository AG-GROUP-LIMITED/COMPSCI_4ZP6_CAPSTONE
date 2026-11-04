import React from 'react'
import { NavBar, NavLeft, NavCenter, NavRight } from './Nav/NavBar.tsx'
import { SideBar } from './SideBar.tsx'



interface LayoutProps {
    children: React.ReactNode;
}

export function MainLayout({children}: LayoutProps) {
    return (
        <div className="flex h-screen flex-col">
            <NavBar>
                <NavLeft>GRID</NavLeft>
                <NavCenter>PROJECT TITLE</NavCenter>
                <NavRight>SEARCH</NavRight>
            </NavBar>
            <div className="flex-1 flex flex-row">
                <SideBar>
                    <></>
                </SideBar>
                <div className="flex-1 min-w-0 min-h-0 p-2">
                    {children}
                </div>
            </div>
        </div>
    );
};