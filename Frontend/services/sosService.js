

import API from './api'; // path to your configured Axios instance
import AsyncStorage from '@react-native-async-storage/async-storage';

const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem('token');
  return {
    Authorization: `Bearer ${token}`,
  };
};

// SOS ALERT
export const sendSOS = async (sosData) => {
  const headers = await getAuthHeaders();
  const response = await API.post('/sos/send/', sosData, { headers });
  return response.data;
};

// GET CONTACTS
export const getEmergencyContacts = async () => {
  const headers = await getAuthHeaders();
  const response = await API.get('/sos/emergency-contacts/', { headers });
  return response.data;
};

// ADD CONTACT
export const addEmergencyContact = async (data) => {
  const headers = await getAuthHeaders();
  const response = await API.post('/sos/emergency-contacts/', data, { headers });
  return response.data;
};

// DELETE CONTACT
export const deleteEmergencyContact = async (id) => {
  const headers = await getAuthHeaders();
  const response = await API.delete(`/sos/emergency-contacts/${id}/`, { headers });
  return response.data;
};
