import httpClient from '../http-common';

// Fetch all backlog items
const getAll = async () => {
    try {
        const response = await httpClient.get('/BacklogItems');
        return response.data;
    } catch (error) {
        console.error('Error fetching backlog items:', error);
        throw error;
    }
};

// Fetch backlog items by Backlog ID
const getByBacklogId = async (backlogId) => {
    try {
        const response = await httpClient.get(`/BacklogItems/id/${backlogId}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching backlog items for backlog ID: ${backlogId}`, error);
        throw error;
    }
};

// Create a new backlog item
const create = async (backlogData) => {
    try {
        const response = await httpClient.post('/BacklogItems', backlogData);
        return response.data;
    } catch (error) {
        console.error('Error creating backlog item:', error);
        throw error;
    }
};

// Update a backlog item
const update = async (backlogId, backlogData) => {
    try {
        const response = await httpClient.put(`/BacklogItems/${backlogId}`, backlogData);
        return response.data;
    } catch (error) {
        console.error(`Error updating backlog item with ID: ${backlogId}`, error);
        throw error;
    }
};

// Delete a backlog item
const deleteById = async (backlogId) => {
    try {
        const response = await httpClient.delete(`/BacklogItems/${backlogId}`);
        return response.data;
    } catch (error) {
        console.error(`Error deleting backlog item with ID: ${backlogId}`, error);
        throw error;
    }
};

// Additional helper functions can be added here (e.g., filtering by type or status)

// Exporting functions as named exports
export default { getAll, getByBacklogId, create, update, deleteById };
