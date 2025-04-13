import API from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Helper function to get the auth token from AsyncStorage
const getAuthHeaders = async () => {
  
  const token = await AsyncStorage.getItem('token'); // Get the token from AsyncStorage
  console.log('Token used in headers:', token);
  
  return {
    Authorization: `Bearer ${token}`,
  };
};

// Create User Profile API call
export const createProfile = async (data) => {
  const headers = await getAuthHeaders(); // Get the Authorization header
  return API.post('users/create-profile/', data, { headers }); // Add headers to the request
};

// Update User Profile API call
export const updateProfile = async (data) => {
  const headers = await getAuthHeaders(); // Get the Authorization header
  return API.put('users/update-profile/', data, { headers }); // Add headers to the request
};

// Create User Preferences API call
export const createPreference = async (data) => {
  const headers = await getAuthHeaders(); // Get the Authorization header
  return API.post('users/create-preference/', data, { headers }); // Add headers to the request
};

// Update User Preferences API call
export const updatePreference = async (data) => {
  const headers = await getAuthHeaders(); // Get the Authorization header
  return API.put('users/update-preference/', data, { headers }); // Add headers to the request
};

// Create Emergency Contact API call
export const createEmergencyContact = async (data) => {
  const headers = await getAuthHeaders(); // Get the Authorization header
  return API.post('users/create-emergency-contact/', data, { headers }); // Add headers to the request
};

// Update Emergency Contact API call
export const updateEmergencyContact = async (data) => {
  const headers = await getAuthHeaders(); // Get the Authorization header
  return API.put('users/update-emergency-contact/', data, { headers }); // Add headers to the request
};
