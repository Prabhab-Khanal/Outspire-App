import axios from 'axios';

const API = axios.create({
  baseURL: 'http://192.168.1.77:8000/', // Replace with your Django backend URL
  headers: {
    'Content-Type': 'application/json',
  },
});

export default API;
