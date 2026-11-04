import React, { useState } from 'react'

interface SideMenuProps {
    children: React.ReactNode;
}

export default function SideMenu({children}: SideMenuProps) {
    return (
        <button className="flex p-2 w-full h-10 rounded-md transition-colors hover:bg-gray-100 justify-start gap-2">
            {children}
        </button>
    )
}