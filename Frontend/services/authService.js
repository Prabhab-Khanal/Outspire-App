import API from './api';

export const registerUser = (data) => API.post('users/register/', data);
export const loginUser = (data) => API.post('users/login/', data);
export const sendOTP = (data) => API.post('users/generate-otp/', data);
export const verifyOTP = (data) => API.post('users/verify-otp/', data);
export const resetPassword = (data) => API.post('users/reset-password/', data);
