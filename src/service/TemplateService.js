import httpClient from '../http-common';

const getAll = () => {
    console.log('Fetching all templates...');
    return httpClient.get('/template/all');
};

const getTemplate = (id) => {
    console.log('Fetching template with ID:', id);
    return httpClient.get(`/template/${id}`);
};

const getTemplatesByType = (type) => {
    console.log('Fetching templates by type:', type);
    return httpClient.get(`/template/type/${type}`);
};

const getDefaultTemplates = () => {
    console.log('Fetching default templates...');
    return httpClient.get('/template/default');
};

const create = (templateData) => {
    console.log('Creating template with data:', templateData);
    return httpClient.post('/template/create', templateData);
};

const update = (id, templateData) => {
    console.log('Updating template with ID:', id);
    console.log('Update data:', templateData);
    return httpClient.put(`/template/update/${id}`, templateData);
};

const deleteTemplate = (id) => {
    console.log('Deleting template with ID:', id);
    return httpClient.delete(`/template/delete/${id}`);
};

const cloneTemplate = (id) => {
    console.log('Cloning template with ID:', id);
    return httpClient.post(`/template/${id}/clone`);
};

export default { 
    getAll, 
    getTemplate, 
    getTemplatesByType, 
    getDefaultTemplates,
    create, 
    update, 
    delete: deleteTemplate,
    clone: cloneTemplate 
};