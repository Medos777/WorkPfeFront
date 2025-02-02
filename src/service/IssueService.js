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

const transformIssueData = (data) => {
    const transformed = {
        title: data.title?.trim(),
        description: data.description?.trim(),
        status: data.status?.toLowerCase() || 'to do',
        priority: (data.priority || 'medium').toLowerCase(),
        startDate: data.startDate || undefined,
        dueDate: data.dueDate || undefined,
        owner: data.owner || localStorage.getItem('userId'),
        assignee: data.assignee || null,
        watchers: data.watchers || []
    };

    // Handle project field separately to preserve null values
    if (data.project !== undefined) {
        transformed.project = data.project || null;
    }

    // Remove undefined values, but keep null values
    Object.keys(transformed).forEach(key => {
        if (transformed[key] === undefined) {
            delete transformed[key];
        }
    });

    console.log('Original issue data:', data);
    console.log('Transformed issue data:', transformed);
    return transformed;
};

const update = (issueId, issueData) => {
    const transformedData = transformIssueData(issueData);
    console.log('Transformed update data:', transformedData); // Debug log
    return httpClient.put(`/issues/${issueId}`, transformedData);
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
