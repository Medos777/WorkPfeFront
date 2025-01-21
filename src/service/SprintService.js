import httpClient from '../http-common';

const getAll = () => {
    return httpClient.get('/sprints');
};

const getSprint = (sprintId) => {
    return httpClient.get(`/sprints/id/${sprintId}`);
};

const create = (sprintData) => {
    return httpClient.post('/sprints', sprintData);
};

const update = (sprintId, sprintData) => {
    return httpClient.put(`/sprints/${sprintId}`, sprintData);
};

const deleteSprint = (sprintId) => {
    return httpClient.delete(`/sprints/${sprintId}`);
};

const updateBacklogItems = (sprintId, backlogItemId) => {
    console.log('Sending backlogItemId:', backlogItemId);
    return httpClient.put(`/sprints/${sprintId}/backlogItems`, { backlogItemId });
};

const getByProject = (projectId) => {
    console.log('Fetching sprints for project:', projectId);
    return httpClient.get(`/sprints/project/${projectId}`);
};

export default { 
    getAll, 
    getSprint, 
    create, 
    update, 
    deleteSprint, 
    updateBacklogItems, 
    getByProject 
};
