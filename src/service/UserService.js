import httpClient from '../http-common';
const getAll = () => {
    return httpClient.get(('/users'));
}
const getUser =  usersId => {
    return httpClient.get(`/users/id/${usersId}`);
}
const getUserByRole =  role => {
    return httpClient.get(`/users/role/${role}`);
}
const create = ( userstData) => {
    return httpClient.post(`/users`, userstData);
}
const update = ( usersId,usersData) => {
    return httpClient.put(`/users/${usersId}`, usersData);
}
const deleteUsers =  usersId =>{
    return httpClient.delete(`/users/${usersId}`);
}
export  default {getAll,create,deleteUsers,getUser,update,getUserByRole}
