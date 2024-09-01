import httpClient from '../http-common';
const getAll = () => {
    return httpClient.get(('/projects'));
}
const getProject =  projectId => {
    return httpClient.get(`/projects/id/${projectId}`);
}
const create = ( projectData) => {
    return httpClient.post(`/projects`, projectData);
}
const update = ( projectId,projectData) => {
    return httpClient.put(`/projects/${projectId}`, projectData);
}
const deleteProject =  projectId =>{
    return httpClient.delete(`/projects/${projectId}`);
}
export  default {getAll,create,deleteProject,getProject,update}
