import React, { useState, useEffect } from 'react';
import ProjectService from "../service/ProjectService";
import ProjectForm from './ProjectForm';
import { useParams } from 'react-router-dom';

function UpdateProject() {
    const [projectData, setProjectData] = useState(null);
    const { projectId } = useParams();

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const response = await ProjectService.getProject(projectId);
                setProjectData(response.data);
            } catch (error) {
                console.error("Failed to fetch project", error);
            }
        };

        fetchProject();
    }, [projectId]);

    const handleUpdate = (projectId, updatedData) => {
        return ProjectService.update(projectId, updatedData);
    };

    return (
        <div>
            {projectData ? (
                <ProjectForm isEdit={true} projectData={projectData} onSubmit={handleUpdate} />
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
}

export default UpdateProject;
