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

export default { getAll, create, deleteSprint, getSprint, update };
