import httpClient from '../http-common';

const getAll = (filters = {}) => {
    return httpClient.get("/epics", { params: filters });
};

const getById = (epicId) => {
    return httpClient.get(`/epics/${epicId}`);
};

const getByProject = (projectId) => {
    return httpClient.get(`/epics/project/${projectId}`);
};

const transformEpicData = (data) => {
    const transformed = {
        name: data.name?.trim(),
        description: data.description?.trim(),
        project: data.projectId || data.project,
        status: (data.status || 'to do').toLowerCase(),
        priority: (data.priority || 'medium').toLowerCase(),
        startDate: data.startDate || undefined,
        dueDate: data.dueDate || undefined,
        owner: data.owner || localStorage.getItem('userId'),
        watchers: data.watchers || []
    };

    // Remove undefined/null values
    Object.keys(transformed).forEach(key => {
        if (transformed[key] === undefined || transformed[key] === null) {
            delete transformed[key];
        }
    });

    return transformed;
};

const create = (epicData) => {
    const transformedData = transformEpicData(epicData);
    return httpClient.post("/epics", transformedData);
};

const update = (epicId, epicData) => {
    const transformedData = transformEpicData(epicData);
    return httpClient.put(`/epics/${epicId}`, transformedData);
};

const remove = (epicId) => {
    return httpClient.delete(`/epics/${epicId}`);
};

const updateProgress = (epicId) => {
    return httpClient.post(`/epics/${epicId}/progress`);
};

const addWatcher = (epicId, userId) => {
    return httpClient.post(`/epics/${epicId}/watchers`, { userId });
};

const removeWatcher = (epicId, userId) => {
    return httpClient.delete(`/epics/${epicId}/watchers`, { 
        data: { userId } 
    });
};

const EpicService = {
    getAll,
    getById,
    getByProject,
    create,
    update,
    remove,
    updateProgress,
    addWatcher,
    removeWatcher
};

export default EpicService;