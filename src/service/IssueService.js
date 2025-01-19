import httpClient from '../http-common';

const getAll = () => {
    return httpClient.get('/issues');
};

const getById = (issueId) => {
    return httpClient.get(`/issues/${issueId}`);
};

const getByProject = (projectId) => {
    return httpClient.get(`/issues/project/${projectId}`);
};

const getByEpic = (epicId) => {
    return httpClient.get(`/issues/epic/${epicId}`);
};

const getBySprint = (sprintId) => {
    return httpClient.get(`/issues/sprint/${sprintId}`);
};

const create = (issueData) => {
    return httpClient.post('/issues', issueData);
};

const update = (issueId, issueData) => {
    return httpClient.put(`/issues/${issueId}`, issueData);
};

const remove = (issueId) => {
    return httpClient.delete(`/issues/${issueId}`);
};

const addComment = (issueId, commentData) => {
    return httpClient.post(`/issues/${issueId}/comments`, commentData);
};

const addAttachment = (issueId, file) => {
    const formData = new FormData();
    formData.append('attachment', file);
    return httpClient.post(`/issues/${issueId}/attachments`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};

const updateTimeTracking = (issueId, timeData) => {
    return httpClient.post(`/issues/${issueId}/timetracking`, timeData);
};

export default {
    getAll,
    getById,
    getByProject,
    getByEpic,
    getBySprint,
    create,
    update,
    remove,
    addComment,
    addAttachment,
    updateTimeTracking
};
