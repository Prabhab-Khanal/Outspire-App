import API from './api';
import AsyncStorage from '@react-native-async-storage/async-storage'; // for getting token
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext'; // Import AuthContext

// Helper function to get the auth token from the AuthContext
const getAuthHeaders = (userToken) => {
  console.log(userToken)
  if (userToken) {
    return {
      Authorization: `Bearer ${userToken}`,
    };
  }

  // If no token found, throw an error or handle as needed
  throw new Error('Authorization token is missing.');
};

// Create User Profile API call
export const createProfile = async (data) => {
  console.log('Data sent is', data);
  return API.post('users/create-profile/', data);  // Add headers to the request
};

export const getProfile = async (userToken) => {
  const headers = getAuthHeaders(userToken); // Pass the userToken from context here
  return API.get('users/profile/', { headers }); // Add headers to the request
};

// Update User Profile API call

export const updateProfile = async (token, formData) => {
  return await API.put(`/users/update-profile/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    },
  });
};

export const deleteEmergencyContact = async (contactId, userToken) => {
  const headers = getAuthHeaders(userToken);  // Pass the userToken for authentication
  try {
    const response = await API.delete('users/delete-emergency-contact/', {
      headers, 
      data: { contact_id: contactId }  // Pass the contact_id as data
    });
    return response;  // Return the response from the API
  } catch (error) {
    console.error('Error deleting emergency contact:', error);  // Log any errors
    throw error;  // Throw error to be handled in the calling component
  }
};

// Create User Preferences API call
export const createPreference = async (data) => {
  const token = await AsyncStorage.getItem('accessToken'); // or whatever you saved it as
  return API.post('/users/create-preference/', data, {
    
  });
};

export const getPreferences = (userToken) => {
  const headers = getAuthHeaders(userToken); // ❌ Problem: userToken is missing here
  return API.get('users/preferences/',  { headers }); // ❌ Problem: put instead of get
};

// Update User Preferences API call
export const updatePreference = async (data, userToken) => {
  const headers = getAuthHeaders(userToken); // Pass the userToken from context here
  return API.put('users/update-preference/', data, { headers }); // Add headers to the request
};

// Create Emergency Contact API call
export const createEmergencyContact = async (data, userToken) => {
  const headers = getAuthHeaders(userToken);  // Pass the userToken from context here
  return API.post('users/create-emergency-contact/', data, { headers }); // Add headers to the request
};

// Update Emergency Contact API call
export const updateEmergencyContact = async (data, userToken) => {
  const headers = getAuthHeaders(userToken);  // Pass the userToken from context here
  return API.put('users/update-emergency-contact/', data, { headers }); // Add headers to the request
};

export const getEmergencyContact = async (userToken) => {
  const headers = getAuthHeaders(userToken);  // Add token to headers
  return API.get('users/emergency-contact/', { headers }); // GET request to fetch emergency contact
};