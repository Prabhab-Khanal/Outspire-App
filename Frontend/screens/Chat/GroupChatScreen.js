import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Modal
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { connectGroupWebSocket, sendGroupSockMessage, disconnectAllSockets } from '../../services/chatService';
import { fetchGroupMessages } from '../../services/chatService';
import { AuthContext } from '../../contexts/AuthContext';

export default function GroupChatRoomScreen({ route, navigation }) {
  const { groupId, groupName } = route.params;
  const { user } = useContext(AuthContext);

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showOptions, setShowOptions] = useState(false);
  const flatListRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    const loadMessages = async () => {
      try {
        const res = await fetchGroupMessages(groupId);
        console.log('📚 Old Group Messages:', res.data);
        setMessages(res?.data || []);
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      } catch (err) {
        console.error('Error loading group messages:', err);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();

    const roomName = `group_${groupId}`; // 🛠 dynamic based on group id
    connectGroupWebSocket(roomName, (data) => {
      console.log('📩 New Group WebSocket message received:', data);
      setMessages(prev => [...prev, {
        text: data.message,
        sender_username: data.sender_username,
      }]);
    });

    return () => {
      disconnectAllSockets();
    };
  }, [user, groupId]);

  const handleSend = () => {
    if (!newMessage.trim()) return;

    const payload = {
      message: newMessage,
      sender_user_id: user.user_id,
      group_id: groupId,
    };

    console.log('🚀 Sending Group WebSocket payload:', payload);
    sendGroupSockMessage(payload);

    // Optimistically add message immediately
    
    setNewMessage('');
  };

  const openSettings = () => {
    setShowOptions(false);
    navigation.navigate('GroupSettings', { groupId, groupName });
  };

  const openReport = () => {
    setShowOptions(false);
    navigation.navigate('ReportScreen', { groupId, type: 'group' });
  };

  const renderItem = ({ item }) => {
    const isMyMessage = item.sender_username === user?.username;
    return (
      <View style={isMyMessage ? styles.myMessage : styles.theirMessage}>
        <Text style={styles.messageText}>
          <Text style={{ fontWeight: 'bold' }}>{isMyMessage ? 'You' : item.sender_username}: </Text>
          {item.text}
        </Text>
      </View>
    );
  };

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 50 }} size="large" />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{groupName}</Text>
        <TouchableOpacity onPress={() => setShowOptions(true)}>
          <Icon name="dots-vertical" size={26} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>No messages yet.</Text>}
      />

      {/* Message Input */}
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

      {/* Modal Options */}
      <Modal
        visible={showOptions}
        transparent
        animationType="fade"
        onRequestClose={() => setShowOptions(false)}
      >
        <TouchableOpacity
          style={styles.modalBackground}
          activeOpacity={1}
          onPressOut={() => setShowOptions(false)}
        >
          <View style={styles.optionsContainer}>
            <TouchableOpacity onPress={openSettings}>
              <Text style={styles.optionText}>Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={openReport}>
              <Text style={styles.optionText}>Report</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderColor: '#ddd' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  inputRow: { flexDirection: 'row', alignItems: 'center', padding: 10, borderTopWidth: 1, borderColor: '#ddd' },
  input: { flex: 1, backgroundColor: '#f2f2f2', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14 },
  myMessage: { alignSelf: 'flex-end', backgroundColor: '#DCF8C6', borderRadius: 10, marginVertical: 4, padding: 10, maxWidth: '80%' },
  theirMessage: { alignSelf: 'flex-start', backgroundColor: '#EAEAEA', borderRadius: 10, marginVertical: 4, padding: 10, maxWidth: '80%' },
  messageText: { fontSize: 14 },
  modalBackground: { flex: 1, justifyContent: 'flex-start', alignItems: 'flex-end', padding: 16, backgroundColor: 'rgba(0,0,0,0.3)' },
  optionsContainer: { backgroundColor: '#fff', borderRadius: 8, padding: 12, width: 150 },
  optionText: { fontSize: 16, paddingVertical: 10, color: '#333' },
});
