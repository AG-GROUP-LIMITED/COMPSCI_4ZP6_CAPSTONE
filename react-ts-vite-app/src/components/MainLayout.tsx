import React from 'react'
import { Outlet } from 'react-router'
import { NavBar, NavLeft, NavCenter, NavRight } from './Nav/NavBar.tsx'


interface LayoutProps {
    children: React.ReactNode;
}

export function MainLayout() {
    return (
        <div className="flex h-screen flex-col">
            <NavBar>
                <NavLeft>GRID</NavLeft>
                <NavCenter>PROJECT TITLE</NavCenter>
                <NavRight>SEARCH</NavRight>
            </NavBar>
            <div className="flex-1 flex flex-row">
                <Outlet/>
            </div>
        </div>
    );
};