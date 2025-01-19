import httpClient from '../http-common';

const getAll = () => {
    return httpClient.get("/projects");
};

const create = data => {
    return httpClient.post("/projects", data);
};

const get = id => {
    return httpClient.get(`/projects/${id}`);
};

const update = (id, data) => {
    return httpClient.put(`/projects/${id}`, data);
};

const remove = id => {
    return httpClient.delete(`/projects/${id}`);
};

const removeAll = () => {
    return httpClient.delete(`/projects`);
};

const findByTitle = title => {
    return httpClient.get(`/projects?title=${title}`);
};

const getProjectProgress = projectId => {
    return httpClient.get(`/projects/${projectId}/progress`);
};

const getBudgetAnalytics = projectId => {
    return httpClient.get(`/projects/${projectId}/budget-analytics`);
};

const getTeamPerformance = projectId => {
    return httpClient.get(`/projects/${projectId}/team-performance`);
};

const searchProjects = searchParams => {
    return httpClient.post(`/projects/search`, searchParams);
};

const getProjectMessages = projectId => {
    return httpClient.get(`/projects/${projectId}/messages`);
};

const sendProjectMessage = (projectId, message) => {
    return httpClient.post(`/projects/${projectId}/messages`, message);
};

const exportProjectReport = (projectId, format) => {
    return httpClient.get(`/projects/${projectId}/export/${format}`);
};

const scheduleReport = (projectId, scheduleData) => {
    return httpClient.post(`/projects/${projectId}/schedule-report`, scheduleData);
};

const getProjectAnalytics = projectId => {
    return httpClient.get(`/projects/${projectId}/analytics`);
};

const getProjectPerformance = projectId => {
    return httpClient.get(`/projects/${projectId}/performance`);
};

export default {
    getAll,
    create,
    get,
    update,
    remove,
    removeAll,
    findByTitle,
    getProjectProgress,
    getBudgetAnalytics,
    getTeamPerformance,
    searchProjects,
    getProjectMessages,
    sendProjectMessage,
    exportProjectReport,
    scheduleReport,
    getProjectAnalytics,
    getProjectPerformance
};
