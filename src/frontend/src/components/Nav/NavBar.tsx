import React from 'react'
import { useNavigate } from 'react-router';

interface NavProps {
    children: React.ReactNode;
};

export function NavBar({children}: NavProps) {
    return (
        <nav className="flex items-center justify-between border-b border-b-gray-300 sticky top-0 px-6 h-8 md:h-12">
            {children}
        </nav>
    );
};

export function NavLeft({children}: NavProps) {
    const navigate = useNavigate();

    return (
        <div className="font-bold" onClick={() => navigate("/home")}>
            {children}
        </div>
    )
}

export function NavCenter({children}: NavProps) {
    return (
        <div className="font-semibold">
            {children}
        </div>
    )
}

export function NavRight({children}: NavProps) {
    return (
        <div>
            {children}
        </div>
    )
}