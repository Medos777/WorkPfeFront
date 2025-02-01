import httpClient from '../http-common';

const getAll = () => {
    return httpClient.get('/Backlogs');
};

const getById = id => {
    return httpClient.get(`/Backlogs/id/${id}`);
};

const getByProject = (projectId) => {
    return httpClient.get(`/Backlogs/projectId/${projectId}`);
};
const create = data => {
    return httpClient.post('/Backlogs', data);
};

const update = (id, data) => {
    return httpClient.put(`/Backlogs/${id}`, data);
};

const remove = id => {
    return httpClient.delete(`/Backlogs/${id}`);
};
const findByUser= userId => {
    return httpClient.get(`/Backlogs/user/${userId}`);
    
};

export default {
    getAll,
    getById,
    getByProject,
    create,
    update,
    remove,
    findByUser
};
