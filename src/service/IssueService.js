import httpClient from '../http-common';

const getAll = () => {
    return httpClient.get('/issues');
};

const getIssues = (issueId) => {
    return httpClient.get(`/issues/id/${issueId}`);
};

const create = (issueData) => {
    return httpClient.post('/issues', issueData);
};

const update = (issueId, issueData) => {
    return httpClient.put(`/issues/${issueId}`, issueData);
};

const deleteIssues = (issueId) => {
    return httpClient.delete(`/issues/${issueId}`);
};

export default { getAll, create, deleteIssues, getIssues, update };
