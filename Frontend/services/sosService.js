

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


