import API from './api'; // your axios instance

import { API_BASE_URL } from './api';  // your server URL (example: http://192.168.1.67:8000)
import AsyncStorage from '@react-native-async-storage/async-storage';

let socket = null;

export const connectWebSocket = (roomName, onMessageCallback) => {
  const wsUrl = `ws://192.168.1.69:8001/ws/privatechat/${roomName}/`;
  socket = new WebSocket(wsUrl);

  socket.onopen = () => {
    console.log('✅ WebSocket connected to', wsUrl);
  };

  socket.onmessage = (e) => {
    const data = JSON.parse(e.data);
    console.log('📩 WebSocket new message received:', data);
    onMessageCallback(data);
  };

  socket.onerror = (e) => {
    console.error('❌ WebSocket error:', e.message);
  };

  socket.onclose = (e) => {
    console.warn('⚡ WebSocket closed:', e.code, e.reason);
  };
};

export const disconnectWebSocket = () => {
  if (socket) {
    socket.close();
    socket = null;
  }
};

export const sendWebSocketMessage = (payload) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(payload));
  } else {
    console.error('❌ Cannot send message. WebSocket is not open.');
  }
};


export const getChatUsers = async () => {
  const response = await API.get('/chats/chat-users/');
  return response.data;
};



export const getChatGroups = async () => {
  const res = await API.get('chats/group/list/'); // You will need to create this API if not already
  return res.data;
};


export const sendMessage = (receiver, text) => API.post('chats/send/', { receiver, text });
export const fetchMessages = (receiver) => API.get(`chats/fetch/?user=${receiver}`);
export const sendGroupMessage = (group_id, text) => API.post('chats/group/send/', { group_id, text });
export const fetchGroupMessages = (group_id) => API.get(`chats/group/fetch/${group_id}/`);

export const createGroup = (name, members) => API.post('chats/group/create/', {
  name,
  members, // members = list of user IDs
});

export const addGroupMembers = (groupId, members) => {
  return API.post('chats/group/add-members/', { group_id: groupId, members });
};

export const renameGroup = (groupId, newName) => {
  return API.post('chats/group/rename/', { group_id: groupId, new_name: newName });
};

export const getGroupMembers = async (groupId) => {
  const res = await API.get(`/chats/group/members/${groupId}/`);
  return res.data;
};

export const leaveGroup = async (groupId) => {
  const response = await API.post(`/chats/leave-group/${groupId}/`);
  return response.data;
};



let groupSocket = null;



export const connectGroupWebSocket = (roomName, onMessageCallback) => {
  const wsUrl = `ws://192.168.1.69:8001/ws/groupchat/${roomName}/`;

  console.log('🌐 Connecting Group WebSocket:', wsUrl);

  groupSocket = new WebSocket(wsUrl);

  groupSocket.onopen = () => {
    console.log('✅ Group WebSocket Connected.');
  };

  groupSocket.onmessage = (e) => {
    const data = JSON.parse(e.data);
    console.log('📩 Group WebSocket New Message:', data);
    onMessageCallback(data);
  };

  groupSocket.onerror = (e) => {
    console.error('❌ Group WebSocket Error:', e.message);
  };

  groupSocket.onclose = (e) => {
    console.warn('⚡ Group WebSocket Closed:', e.code, e.reason);
  };
};

export const sendGroupSockMessage = (payload) => {
  if (groupSocket && groupSocket.readyState === WebSocket.OPEN) {
    console.log('🚀 Sending Group WebSocket Message:', payload);
    groupSocket.send(JSON.stringify(payload));
  } else {
    console.error('❌ Group WebSocket not open.');
  }
};


export const disconnectAllSockets = () => {
  
  if (groupSocket) {
    groupSocket.close();
    groupSocket = null;
  }
  console.log('🔌 Disconnected all WebSockets.');
};