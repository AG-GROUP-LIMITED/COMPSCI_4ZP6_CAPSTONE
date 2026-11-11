import React, { useState, useEffect, useRef } from 'react'

interface DropDownProps {
    children: React.ReactNode;
}

export function DropDown({children}: DropDownProps) {
    const [isOpen, setIsOpen] = useState(false);

    const toggleOpen = () => {
        setIsOpen(!isOpen);
    };

    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        console.log("in useeffect")
        const checkIfClickedOutside = (e: MouseEvent) => {
            if (isOpen && ref.current && !ref.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        }

        document.addEventListener("mousedown", checkIfClickedOutside);

        return () => {
            document.removeEventListener("mousedown", checkIfClickedOutside)
        }
    }, [isOpen]);

    return (
        <>
            {isOpen && (
                <div
                    className={`origin-top-right absolute left-2 right-2 bottom-2 -top-${10*(React.Children.count(children)-1)} border border-gray-300 rounded-md shadow-lg bg-white z-999`}
                    ref={ref}
                >
                        {children}
                </div>
            )}
            <button className="w-full h-10 border border-gray-300 rounded-md transition-colors hover:bg-gray-100 flex items-center justify-center gap-2" onClick={toggleOpen} tabIndex={0}>
                <span>Create</span>
            </button>
        </>
    );
};
