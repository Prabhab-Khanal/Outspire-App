import API from './api'; // path to your configured Axios instance
import AsyncStorage from '@react-native-async-storage/async-storage';

// Get Authorization headers
export function decodeJWT(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('❌ Failed to decode token manually:', e);
    return null;
  }
}

// 1. Get and validate/refresh tokens
export const getAuthHeaders = async () => {
  try {
    let accessToken = await AsyncStorage.getItem('userToken');
    const refreshToken = await AsyncStorage.getItem('refreshToken');

    console.log('🔑 Initial access token:', accessToken );
    console.log('🔑 Refresh token:', refreshToken );

    if (accessToken) {
      const decoded = decodeJWT(accessToken);
      const currentTime = Date.now() / 1000; // in seconds

      if (!decoded || decoded.exp < currentTime) {
        console.log('🔄 Access token expired. Refreshing...');
        const response = await API.post('/api/token/refresh/', {
          refresh: refreshToken,
        });

        accessToken = response.data.access;
        await AsyncStorage.setItem('accessToken', accessToken);
        console.log('✅ Access token refreshed successfully!');
      } else {
        console.log('✅ Access token is still valid.');
      }
    } else {
      console.error('❌ No access token found.');
      throw new Error('No access token found.');
    }

    return {
      Authorization: `Bearer ${accessToken}`,
    };

  } catch (error) {
    console.error('❌ Error getting auth headers:', error);
    throw error;
  }
};

// CREATE TRAIL
export const createTrail = async (formData) => {
  try {
    const headers = await getAuthHeaders();

    const response = await API.post('/trails/create/', formData, {
      headers: {
        ...headers,
        'Content-Type': 'multipart/form-data',
      },
    });

    // Check if response status is 201 (Created)
    if (response.status === 201) {
      console.log('Trail created successfully:', response.data);
      return response.data;
    } else {
      console.error('Error creating trail:', response.data);
      throw new Error('Failed to create trail');
    }

  } catch (error) {
    // Log the error in detail
    console.error('Error while creating trail:', error.response || error);
    if (error.response) {
      // Handle response errors
      console.log('Response error:', error.response.data);
    }
    throw error; // Rethrow to be caught by frontend
  }
};



// LIST TRAILS
export const getAllTrails = async () => {
  const response = await API.get('/trails/');
  return response.data;
};

// GET SINGLE TRAIL DETAILS
export const getTrailDetail = async (trailId) => {
  const response = await API.get(`/trails/${trailId}/`);
  return response.data;
};

// ADD REVIEW
export const addReview = async (trailId, reviewData) => {
  const headers = await getAuthHeaders();
  const response = await API.post(`/trails/${trailId}/reviews/`, reviewData, { headers });
  return response.data;
};

// UPLOAD OFFLINE MAP
export const uploadOfflineMap = async (trailId, fileData) => {
  const headers = await getAuthHeaders();
  const response = await API.post(`/trails/${trailId}/offline-map/`, fileData, {
    headers: {
      ...headers,
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};
