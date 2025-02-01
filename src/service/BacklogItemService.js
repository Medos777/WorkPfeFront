import httpClient from '../http-common';

const getAll = () => {
    return httpClient.get('/BacklogItems');
};

const getBacklogItems = (BacklogsId) => {
    return httpClient.get(`/BacklogItems/id/${BacklogsId}`);
};

const create = (BacklogsData) => {
    return httpClient.post('/BacklogItems', BacklogsData);
};

const update = (BacklogsId, BacklogsData) => {
    return httpClient.put(`/BacklogItems/${BacklogsId}`, BacklogsData);
};

const deleteBacklogItems = (BacklogsId) => {
    return httpClient.delete(`/BacklogItems/${BacklogsId}`);
};
const findByUser= userId => {
    return httpClient.get(`/BacklogItems/user/${userId}`);

};
export default { getAll, create, deleteBacklogItems, getBacklogItems, update ,findByUser};
