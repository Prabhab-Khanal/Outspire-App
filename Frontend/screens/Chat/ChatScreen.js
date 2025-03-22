import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';

const chats = [
  {
    id: '1',
    name: 'Alex',
    avatar: require('../../assets/images/profile.png'),
  },
  {
    id: '2',
    name: 'Samrat',
    avatar: require('../../assets/images/profile.png'),
  },
  {
    id: '3',
    name: 'Jess',
    avatar: require('../../assets/images/profile.png'),
  },
];

export default function ChatScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Chats</Text>
      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.chatCard}
            onPress={() => navigation.navigate('Message', { user: item })}
          >
            <Image source={item.avatar} style={styles.avatar} />
            <Text style={styles.chatName}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f8f9fa' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 15, color: '#222' },
  chatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    marginVertical: 5,
    elevation: 2,
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    marginRight: 15,
  },
  chatName: { fontSize: 18, fontWeight: 'bold' },
});
