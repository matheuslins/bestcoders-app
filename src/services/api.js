import axios from 'axios';

const api = axios.create({
    baseURL: 'https://best-coders-backend.herokuapp.com'
});

export default api;