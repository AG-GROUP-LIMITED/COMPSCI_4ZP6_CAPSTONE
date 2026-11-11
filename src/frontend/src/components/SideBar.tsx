import React, { useContext, createContext, useState, useEffect, useRef, useCallback } from 'react'
import { ChevronFirst, ChevronLast, Network, Files, type LucideIcon } from "lucide-react"
import { DropDown } from "./DropDown.tsx"
import { useNavigate } from 'react-router';

interface SidebarContextType {
    expanded: boolean;
}

const SidebarContext = createContext<SidebarContextType>({expanded: true});

interface SideBarProps {
    sidebarItems: React.ReactNode;
    dropDownItems: React.ReactNode[];
}

interface SideMenuProps {
    icon: LucideIcon;
    label: string;
}

interface SideButtonProps {
    icon?: LucideIcon;
    onclick?: React.MouseEventHandler
    children: React.ReactNode;
}

interface SideSwitchProps {
    icon: LucideIcon;
    label: string;
    onclick?: React.MouseEventHandler
}

export function SideBar({sidebarItems, dropDownItems}: SideBarProps) {
    const [expanded, setExpanded] = useState(true)
    const [minWidth, maxWidth, defaultWidth] = [150, 600, 250];
    const [width, setWidth] = useState(defaultWidth)
    const isResized = useRef(false);
    const navigate=useNavigate();

    //Sidebar drag to resize
    useEffect(() => {
        window.addEventListener("mousemove", (e: MouseEvent) => {
            if (!isResized.current) {
                return;
            }
            setWidth((previousWidth) => {
                const newWidth = (previousWidth + e.movementX / 2);
                if (maxWidth >= newWidth && newWidth >= minWidth) {
                    return newWidth;
                }
                else if (newWidth <= minWidth) {
                    setExpanded(false);
                }
                return previousWidth;
            });
        });
        window.addEventListener("mouseup", () => {
            isResized.current = false;
        })
    }, []);

    console.log("length: " + dropDownItems.length)
    
    return (
        <>
        <aside className={`flex flex-col transition-all duration-75 ease-out`} style={{width: `${expanded? (width / 16) : 3}rem`}}>
            <div className={`flex h-8 md:h-12 p-2 border-t-gray-300 ${expanded? "justify-end" : "justify-center"}`}>
                <button onClick={()  => setExpanded((curr) => !curr)} className="rounded-md hover:bg-gray-100 transition-colors p-1.5 items-center">
                    {expanded ? <ChevronFirst/> : <ChevronLast/>}
                </button>
            </div>
            <div className="flex-1 p-2 justify-between">
                <SidebarContext.Provider value={{expanded}}>
                    <ul>{sidebarItems}</ul>
                </SidebarContext.Provider>
                
            </div>
            <div className="relative p-2 border-t border-t-gray-300">
                <DropDown>
                    {dropDownItems}
                </DropDown>
            </div>
        </aside>

        {/* Sidebar resize handle */}
        <div className={`w-1 select-none ${expanded ? "cursor-col-resize" : ""} border-r border-r-gray-300`} onMouseDown={() => {isResized.current = true;}}> </div>
        </>
    );
};

export function SideButton({icon: Icon, onclick, children}: SideButtonProps) {
    const {expanded} = useContext(SidebarContext)
    return (
        <button className="w-full h-10 border border-gray-300 rounded-md transition-colors hover:bg-gray-100 flex items-center justify-center gap-2" onClick={onclick}>
            {Icon? <Icon/> : <></>}
            <span className={`${expanded? "" : "hidden"}`}>{children}</span>
        </button>
    )
}

interface OpenSideMenuProps {
    active: boolean;
}

function OpenSideMenu({active}: OpenSideMenuProps) {
    if (active) {
        return (
            <>
                <ul>
                    <li>opened</li>
                    <li>opened</li>
                    <li>opened</li>
                </ul>
            </>
        )
    }
    else {
        return <></>
    }
}

export function SideMenu({icon: Icon, label}: SideMenuProps) {
    const {expanded} = useContext(SidebarContext)
    const [isOpened, setIsOpened] = useState(false)

    return (
        <li>
            <button className={`flex p-2 w-full h-10 rounded-md transition-all hover:bg-gray-100 gap-2 items-center ${expanded? "justify-start" : "justify-center"}`} onClick={() => setIsOpened((curr) => !curr)}>
                <Icon/>
                <span className={`transition-all ${expanded? "" : "hidden"}`}>{label}</span>
            </button>
            <OpenSideMenu active={isOpened} />
        </li>
    )
}

export function SideSwitch({icon: Icon, label, onclick}: SideSwitchProps) {
    const {expanded} = useContext(SidebarContext)
    
    return (
        <li>
            <button className={`flex p-2 w-full h-10 rounded-md transition-all hover:bg-gray-100 gap-2 items-center ${expanded? "justify-start" : "justify-center"}`} onClick={onclick}>
                <Icon />
                <span className={`transition-all ${expanded? "" : "hidden"}`}>{label}</span>
            </button>
        </li>
    )
}