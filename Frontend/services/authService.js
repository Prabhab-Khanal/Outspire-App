import API from './api';

// Register User API call
export const registerUser = (data) => {
  return API.post('users/register/', data); // Matches '/register/'
};

// User Login API call
export const loginUser = (data) => {
  return API.post('users/login/', data); // Matches '/login/'
};

// Verify OTP for registration or password reset
export const verifyOTP = (data) => {
  return API.post('users/verify-otp/', {data}); // Matches '/verify-otp/'
};

export const generateOTPForEmailVerification = (data) => {
  return API.post('users/generate-otp-for-email-verification/', data); 
};

// Forgot Password API call
export const forgotPassword = (data) => {
  return API.post('users/forgot-password/', data); // Matches '/forgot-password/'
};

// Reset Password API call
export const resetPassword = (data) => {
  return API.post('users/reset-password/', data); // Matches '/reset-password/'
};

// Google Login API call
export const googleLogin = (data) => {
  return API.post('users/google-login/', data); // Matches '/google-login/'


};
