import API from './api';

// Register User API call
export const registerUser = (formData, multipart = false) => {
  // for React Native multipart uploads, you must set this header
  const headers = multipart
    ? { 'Content-Type': 'multipart/form-data' }
    : {};

  return API.post('users/register/', formData, { headers });
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

export const resendOTP = async (data) => {
  return API.post('/users/resend-otp/', data);
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

export const checkUsernameEmail = (data) => {
  return API.post('/users/check-username-email/', data);
};

export const checkPhoneNumber = (data) => {
  return API.post('/users/check-phone-number/', data);
};

export const resetPasswordAfterOTP = (data) => {
  return API.post('/users/reset-password-after-otp/', data);
};
