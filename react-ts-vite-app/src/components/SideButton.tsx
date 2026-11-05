import React, { useState } from 'react'

interface SideButtonProps {
    onclick?: React.MouseEventHandler
    children: React.ReactNode;
}

export default function SideButton({onclick, children}: SideButtonProps) {
    return (
        <button className="w-full h-10 border border-gray-300 rounded-md transition-colors hover:bg-gray-100" onClick={onclick}>
            {children}
        </button>
    )
}