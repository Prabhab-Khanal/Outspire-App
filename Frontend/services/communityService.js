import API from './api'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios'; 
import jwt_decode from 'jwt-decode';


const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem('userToken');
  if (!token) {
    console.warn('Warning: No user token found in AsyncStorage');
  }
  return {
    Authorization: `Bearer ${token}`,
  };
};
export const getPostById = async (postId, token) => {
    const response = await API.get(`/community/post/${postId}/`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  };
  

export const createPost = async (postData) => {
  const headers = await getAuthHeaders();
  return API.post('/community/posts/create/', postData, { headers });
};

export const uploadPostImages = async (postId, imagesArray) => {
    const headers = {
      ...(await getAuthHeaders()),
      'Content-Type': 'multipart/form-data',
    };
  
    const formData = new FormData();
  
    for (const img of imagesArray) {
      const response = await fetch(img.uri);
      const blob = await response.blob();
  
      formData.append('images', {
        uri: img.uri,
        name: img.fileName || `photo.jpg`,
        type: blob.type || 'image/jpeg',
      });
    }
  
    console.log('📷 FormData ready to upload (after blob conversion)', formData);
  
    return API.post(`/community/posts/${postId}/upload-image/`, formData, { headers });
  };

export const getAllPosts = async () => {
  return API.get('/community/posts/');
};

export const getPeopleList = async (searchQuery = '') => {
  return API.get(`/users/list/?search=${searchQuery}`);
};

// Fetch public user profile by username
export const getPublicUserProfile = async (username) => {
  const headers = await getAuthHeaders();
  try {
    const response = await API.get(`/users/profile/${username}/`, { headers });
    console.log('User profile:', response.data);
    return response.data; // User profile data
  } catch (err) {
    console.error('Error fetching user profile:', err);
    return err.response?.data || err.message;
  }
};

// API to follow or unfollow a user
export const toggleFollow = async (username) => {
  const headers = await getAuthHeaders();
  try {
    const response = await API.post(
      '/users/follow-toggle/',
      { username },
      { headers }
    );
    console.log('Follow/unfollow status:', response.data.message);
    return response.data.message; // Success message
  } catch (err) {
    console.error('Error toggling follow:', err);
    return err.response?.data || err.message;
  }
};

// API to check if the user is following another user
export const checkFollowStatus = async (username) => {
  const headers = await getAuthHeaders();
  try {
    const response = await API.get(`/users/follow-status/`, {
      headers,
      params: { username },
    });
    console.log('Follow status:', response.data.is_following);
    return response.data.is_following; // Boolean value indicating follow status
  } catch (err) {
    console.error('Error checking follow status:', err);
    return err.response?.data || err.message;
  }
};



export const getFollowedUsers = async () => {
  const headers = await getAuthHeaders();
  const response = await API.get('/users/followed-users/', { headers });
  return response.data; // returns list of users
};



export const searchLocationSuggestions = async (query) => {
  const response = await axios.get(
    `https://nominatim.openstreetmap.org/search?q=${query}&format=json&addressdetails=1&limit=5`,
    {
      headers: {
        'User-Agent': 'OutspireApp/1.0 (contact@outspire.com)',
        'Accept-Language': 'en',
      },
    }
  );
  return response.data;
};






function decodeJWT(token) {
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



export const connectCommunityWebSocket = async (onMessageCallback, onErrorCallback) => {
  try {
    let token = await AsyncStorage.getItem('userToken');
    let refreshToken = await AsyncStorage.getItem('refreshToken');

    console.log('Initial token:', token);

    if (token) {
      const decoded = decodeJWT(token);
      console.log('Decoded token payload:', decoded);
      const currentTime = Date.now() / 1000; // seconds

      if (!decoded || decoded.exp < currentTime) {
        console.log('🔄 Token expired or invalid. Refreshing...');
        const response = await axios.post('http://192.168.1.69:8000/api/token/refresh/', {
          refresh: refreshToken,
        });

        token = response.data.access;
        await AsyncStorage.setItem('userToken', token);
        console.log('✅ Token refreshed successfully');
      }
    } else {
      console.error('❌ No token found in storage.');
      return;
    }

    console.log('📡 Connecting WebSocket with token:', token);

    const ws = new WebSocket(`ws://192.168.1.69:8001/ws/community/?token=${token}`);

    ws.onopen = () => {
      console.log('🟢 WebSocket connected');
    };

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      console.log('📩 New WebSocket message:', data);
      if (onMessageCallback) {
        onMessageCallback(data);
      }
    };

    ws.onerror = (e) => {
      console.error('❌ WebSocket Error:', e.message);
      if (onErrorCallback) {
        onErrorCallback(e);
      }
    };

    ws.onclose = () => {
      console.log('🔴 WebSocket disconnected');
    };

    return ws;
  } catch (error) {
    console.error('❌ Error connecting WebSocket:', error);
  }
};


