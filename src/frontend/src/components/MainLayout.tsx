import React, { useState } from 'react'
import { Outlet } from 'react-router'
import { NavBar, NavLeft, NavCenter, NavRight } from './Nav/NavBar.tsx'


interface LayoutProps {
    title?: string;
}

export function MainLayout() {
    const [pageTitle, setPageTitle] = useState("");

    return (
        <div className="flex h-screen flex-col">
            <NavBar>
                <NavLeft>GRID</NavLeft>
                <NavCenter>{pageTitle}</NavCenter>
                <NavRight>SEARCH</NavRight>
            </NavBar>
            <div className="flex-1 flex flex-row">
                <Outlet context={{ setPageTitle }}/>
            </div>
        </div>
    );
};