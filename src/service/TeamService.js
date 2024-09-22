import httpClient from '../http-common';

const getAll = () => {
    return httpClient.get('/teams');
};

const getTeam = (teamId) => {
    return httpClient.get(`/teams/${teamId}`);
};

const createTeam = (teamData) => {
    return httpClient.post('/teams', teamData);
};

const updateTeam = (teamId, teamData) => {
    return httpClient.put(`/teams/${teamId}`, teamData);
};

const deleteTeam = (teamId) => {
    return httpClient.delete(`/teams/${teamId}`);
};

const addMember = (teamId, memberId) => {
    return httpClient.post(`/teams/${teamId}/members`, { userId: memberId });
};

const removeMember = (teamId, memberId) => {
    return httpClient.delete(`/teams/${teamId}/members`, { data: { userId: memberId } });
};

const assignToProject = (teamId, projectId) => {
    return httpClient.post(`/teams/${teamId}/projects`, { projectId });
};

export default {
    getAll,
    getTeam,
    createTeam,
    updateTeam,
    deleteTeam,
    addMember,
    removeMember,
    assignToProject,
};