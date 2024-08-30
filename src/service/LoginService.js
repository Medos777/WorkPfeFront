import httpClient from '../http-common';


const login = (userData) => {
    const token = localStorage.getItem('token');
    if (token) {
        httpClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    return httpClient.post(`/login`, userData);
}

export default {login}