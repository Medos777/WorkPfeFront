import httpClient from '../http-common';

const getAll = () => {
    return httpClient.get('/Backlogs');
};

const getIssues = (BacklogsId) => {
    return httpClient.get(`/Backlogs/id/${BacklogsId}`);
};

const create = (BacklogsData) => {
    return httpClient.post('/Backlogs', BacklogsData);
};

const update = (BacklogsId, BacklogsData) => {
    return httpClient.put(`/Backlogs/${BacklogsId}`, BacklogsData);
};

const deleteIssues = (BacklogsId) => {
    return httpClient.delete(`/Backlogs/${BacklogsId}`);
};

export default { getAll, create, deleteIssues, getIssues, update };
