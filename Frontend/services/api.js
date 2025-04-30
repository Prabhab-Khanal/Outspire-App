import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create Axios instance
const API = axios.create({
  baseURL: 'http://192.168.1.69:8000/',
  
});

export const BASE_URL = 'http://192.168.1.69:8000'; 

// Add Authorization token before each request
API.interceptors.request.use(
  async config => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Handle 401 errors and refresh token
API.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      error.response.data?.code === 'token_not_valid' &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Refresh access token
        const response = await axios.post('http://192.168.1.67:8000/api/token/refresh/', {
          refresh: refreshToken,
        });

        const newAccessToken = response.data.access;
        const newRefreshToken = response.data.refresh;

        // Save new tokens
        await AsyncStorage.setItem('userToken', newAccessToken);
        if (newRefreshToken) {
          await AsyncStorage.setItem('refreshToken', newRefreshToken);
        }

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return API(originalRequest); // Retry
      } catch (refreshError) {
        console.error('Failed to refresh token:', refreshError);
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('refreshToken');
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default API;
