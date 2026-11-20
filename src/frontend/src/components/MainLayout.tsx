import React, { useState } from 'react'
import { Outlet } from 'react-router'
import { NavBar, NavLeft, NavCenter, NavRight } from './Nav/NavBar.tsx'
import { Search, type LucideIcon } from 'lucide-react'


interface LayoutProps {
    title?: string;
}

export function MainLayout() {
    const [pageTitle, setPageTitle] = useState("");

    return (
        <div className="flex h-screen min-h-0 flex-col">
            <NavBar>
                <NavLeft>GRID</NavLeft>
                <NavCenter>{pageTitle}</NavCenter>
                <NavRight>
                    <Search className="absolute right-3 w-4 h-4 hover:h-5 hover:w-5 transition-all text-gray-400 cursor-pointer"/>
                    <input
                        id="editTitle"
                        type="text"
                        className="w-full bg-white px-3 py-1 border border-gray-300 rounded-lg"
                        placeholder="SEARCH"
                        maxLength={255}
                        required
                    />
                </NavRight>
            </NavBar>
            <div className="flex-1 flex min-h-0 flex-row">
                <Outlet context={{ setPageTitle }}/>
            </div>
        </div>
    );
};