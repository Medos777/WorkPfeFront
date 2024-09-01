import React from 'react';
import ProjectService from "../service/ProjectService";
import ProjectForm from './ProjectForm';

function AddProject() {
    const handleCreate = (projectId, projectData) => {
        return ProjectService.create(projectData);
    };

    return (
        <ProjectForm isEdit={false} onSubmit={handleCreate} />
    );
}

export default AddProject;
