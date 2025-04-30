import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { connectWebSocket, sendWebSocketMessage, disconnectWebSocket, fetchMessages } from '../../services/chatService';
import { AuthContext } from '../../contexts/AuthContext';

export default function ChatRoomScreen({ route, navigation }) {
  
  const { receiverUsername , receiverid} = route.params;
  
  
  console.log('router',route.params)
  const { user } = useContext(AuthContext);
  const myUsername = user?.username;
  const myUserId = user?.user_id;

  const flatListRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!myUsername) {
      console.error('User not loaded yet...');
      return;
    }

    const loadPreviousMessages = async () => {
      try {
        const res = await fetchMessages(receiverUsername);
        console.log('📚 Old Messages:', res.data);
        setMessages(res.data);
      } catch (err) {
        console.error('Error fetching old messages:', err);
      } finally {
        setLoading(false);
      }
    };

    const roomName = `user_${myUsername}_${receiverUsername}`;

    loadPreviousMessages();
    connectWebSocket(roomName, (data) => {
      console.log('📩 WebSocket new message received:', data);
      setMessages(prev => [...prev, data]);
    });

    return () => {
      disconnectWebSocket();
    };
  }, [myUsername, receiverUsername]);

  const handleSend = () => {
    if (!newMessage.trim()) return;
  
    const payload = {
      message: newMessage,
      sender_user_id: myUserId,
      receiver_user_id: receiverid, // use correct variable here
    };
  
    console.log('🚀 Sending WebSocket payload:', payload);
    sendWebSocketMessage(payload);
  
    
    
  
    setNewMessage('');
  };
  

  const renderItem = ({ item }) => (
    <View style={item.sender_username === myUsername ? styles.myMessage : styles.theirMessage}>
      <Text style={styles.messageText}>{item.text || item.message}</Text>
    </View>
  );
  

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 50 }} size="large" />;
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{receiverUsername}</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      <View style={styles.inputRow}>
        <TextInput
          placeholder="Type a message..."
          value={newMessage}
          onChangeText={setNewMessage}
          style={styles.input}
        />
        <TouchableOpacity onPress={handleSend} disabled={!newMessage.trim()}>
          <Icon name="send" size={28} color="#007AFF" style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderColor: '#ddd' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 12, color: '#333' },
  inputRow: { flexDirection: 'row', alignItems: 'center', padding: 10, borderTopWidth: 1, borderColor: '#ddd' },
  input: { flex: 1, backgroundColor: '#f2f2f2', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14 },
  myMessage: { alignSelf: 'flex-end', backgroundColor: '#DCF8C6', borderRadius: 10, marginVertical: 4, padding: 10, maxWidth: '80%' },
  theirMessage: { alignSelf: 'flex-start', backgroundColor: '#EAEAEA', borderRadius: 10, marginVertical: 4, padding: 10, maxWidth: '80%' },
  messageText: { fontSize: 14 },
});
