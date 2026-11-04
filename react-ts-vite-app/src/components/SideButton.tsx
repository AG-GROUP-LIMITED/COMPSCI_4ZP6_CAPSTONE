import React, { useState } from 'react'

interface SideButtonProps {
    children: React.ReactNode;
}

export default function SideButton({children}: SideButtonProps) {
    return (
        <button className="w-full h-full border border-gray-300 rounded-md transition-colors hover:bg-gray-100">
            {children}
        </button>
    )
}