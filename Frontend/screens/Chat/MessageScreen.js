import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';

export default function MessageScreen({ route }) {
  const { user } = route.params;

  const [messages, setMessages] = useState([
    {
      id: '1',
      text: 'Hey there!',
      fromSelf: false,
      time: '10:00 AM',
      avatar: require('../../assets/images/profile.png'),
    },
    {
      id: '2',
      text: 'How was your hike?',
      fromSelf: false,
      time: '10:01 AM',
      avatar: require('../../assets/images/profile.png'),
    },
    {
      id: '3',
      text: 'It was awesome!',
      fromSelf: true,
      time: '10:02 AM',
    },
  ]);

  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim()) {
      const newMessage = {
        id: Date.now().toString(),
        text: input,
        fromSelf: true,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([...messages, newMessage]);
      setInput('');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header with avatar and online indicator */}
      <View style={styles.headerRow}>
        <View style={styles.avatarWrapper}>
          <Image source={user.avatar} style={styles.headerAvatar} />
          <View style={styles.onlineDot} />
        </View>
        <Text style={styles.headerText}>{user.name}</Text>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        style={styles.messageList}
        contentContainerStyle={{ paddingVertical: 20 }}
        renderItem={({ item }) => (
          <View
            style={[
              styles.messageRow,
              item.fromSelf ? styles.selfAlign : styles.otherAlign,
            ]}
          >
            {!item.fromSelf && (
              <Image source={item.avatar} style={styles.avatar} />
            )}

            <View
              style={[
                styles.messageBubble,
                item.fromSelf ? styles.selfBubble : styles.otherBubble,
              ]}
            >
              <Text style={[styles.messageText, !item.fromSelf && styles.otherText]}>
                {item.text}
              </Text>
              <Text style={styles.time}>{item.time}</Text>
            </View>
          </View>
        )}
      />

      <View style={styles.inputContainer}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Type a message..."
          style={styles.input}
        />
        <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f2f2f2',
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 10,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    backgroundColor: '#28a745',
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#fff',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  messageList: { flex: 1, paddingHorizontal: 10 },

  messageRow: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'flex-end',
  },
  selfAlign: { justifyContent: 'flex-end' },
  otherAlign: { justifyContent: 'flex-start' },

  avatar: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    marginRight: 8,
  },

  messageBubble: {
    maxWidth: '75%',
    padding: 10,
    borderRadius: 15,
  },
  selfBubble: {
    backgroundColor: '#007bff',
    borderBottomRightRadius: 0,
    alignSelf: 'flex-end',
  },
  otherBubble: {
    backgroundColor: '#e5e5ea',
    borderBottomLeftRadius: 0,
    alignSelf: 'flex-start',
  },

  messageText: {
    fontSize: 15,
    color: '#fff',
  },
  otherText: {
    color: '#000',
  },

  time: {
    fontSize: 10,
    marginTop: 4,
    color: '#999',
    alignSelf: 'flex-end',
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderTopColor: '#ccc',
    borderTopWidth: 1,
    backgroundColor: '#f9f9f9',
  },
  input: {
    flex: 1,
    backgroundColor: '#eee',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    fontSize: 15,
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: '#007bff',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  sendText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
