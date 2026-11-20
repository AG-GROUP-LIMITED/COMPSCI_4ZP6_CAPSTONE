import React, { useState, useEffect, useRef } from 'react'

interface DropDownProps {
    children: React.ReactNode;
}

export function DropDown({children}: DropDownProps) {
    const [isOpen, setIsOpen] = useState(false);

    const toggleOpen = () => {
        setIsOpen(current => !current);
    };

    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) return;
        
        // const checkIfClickedOutside = (e: MouseEvent) => {
        //     if (isOpen && ref.current && !ref.current.contains(e.target as Node)) {
        //         setIsOpen(false);
        //     }
        // }

        // document.addEventListener("mousedown", checkIfClickedOutside);

        // return () => {
        //     document.removeEventListener("mousedown", checkIfClickedOutside)
        // }

        const handleOutsideClick = (e: PointerEvent) => {
            const target = e.target;

            if (
                target instanceof Node &&
                ref.current &&
                !ref.current.contains(target)
            ) {
                setIsOpen(false);
            }
        }

        document.addEventListener("pointerdown", handleOutsideClick, true);

        return () => {
            document.removeEventListener("pointerdown", handleOutsideClick, true);
        };
    }, [isOpen]);

    return (
        <div ref={ref} className="relative w-full">
            {isOpen && (
                <div
                    className={`origin-top-right absolute left-2 right-2 bottom-2 -top-${10*(React.Children.count(children)-1)} border border-gray-300 rounded-md shadow-lg bg-white z-999`}
                    onClick={(e) => {
                        if ((e.target as HTMLElement).closest("button")) {
                            setIsOpen(false);
                        }
                    }}
                >
                        {children}
                </div>
            )}
            <button className="w-full h-10 border border-orange-200 bg-orange-100 rounded-md transition-colors hover:bg-orange-200 hover:border-orange-100 flex items-center justify-center gap-2" onClick={toggleOpen} tabIndex={0}>
                <span>Create</span>
            </button>
        </div>
    );
};
