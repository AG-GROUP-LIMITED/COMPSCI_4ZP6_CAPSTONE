import { useNavigate } from "react-router";

type Project = {
    id: number;
    title: string;
    created: Date;
}

type CardProps = {
    project: Project;
}

export function ProjectCard({project}: CardProps) {
    const navigate = useNavigate();
    return (
        <>
            <li className="flex flex-col w-full border border-gray-300 rounded-md p-3 gap-3 items-center" key={`${project.id}`} onClick={() => navigate(`/projects/${project.id}`)}>
                <div className="w-full flex justify-between">
                    <div className="truncate font-medium text-[12px] sm:text-base">
                    {project.title}
                    </div>
                    <div className="text-gray-500 text-[10px] sm:text-xs content-center">
                    {new Date(project.created).toLocaleDateString()}
                    </div>
                </div>
                <div className="w-full flex h-30 border border-gray-300 items-center justify-center text-gray-500">TODO: graph thumbnail</div>
            </li>
        </>
    )
}