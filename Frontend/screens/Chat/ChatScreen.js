import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Image, RefreshControl, ScrollView, StyleSheet, TextInput } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getFollowedUsers } from '../../services/communityService';
import { getChatGroups, getChatUsers } from '../../services/chatService';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { BASE_URL } from '../../services/api';

export default function ChatScreen({ navigation }) {
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('people');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const fetchData = async () => {
    try {
      const followedUsersRes = await getFollowedUsers();
      const chatUsersRes = await getChatUsers();
      const groupsRes = await getChatGroups();

      const combinedUsers = [...followedUsersRes, ...chatUsersRes];
      const uniqueUsersMap = new Map();
      combinedUsers.forEach(user => {
        uniqueUsersMap.set(user.user_id, user);
      });
      let uniqueUsers = Array.from(uniqueUsersMap.values());

      uniqueUsers.sort((a, b) => {
        const timeA = a.last_message_time ? new Date(a.last_message_time) : new Date(0);
        const timeB = b.last_message_time ? new Date(b.last_message_time) : new Date(0);
        return timeB - timeA;
      });
      groupsRes.sort((a, b) => {
        const timeA = a.last_message_time ? new Date(a.last_message_time) : new Date(0);
        const timeB = b.last_message_time ? new Date(b.last_message_time) : new Date(0);
        return timeB - timeA;
      });
      setUsers(uniqueUsers);
      setGroups(groupsRes);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleStartPrivateChat = (username, user_id) => {
    navigation.navigate('ChatRoom', { receiverUsername: username, receiverid: user_id });
  };

  const handleOpenGroupChat = (groupId, groupName) => {
    navigation.navigate('GroupChatRoom', { groupId: groupId, groupName: groupName });
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading && !refreshing) {
    return <ActivityIndicator style={{ marginTop: 50 }} size="large" />;
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity onPress={() => setActiveTab('people')}>
          <Text style={[styles.tabText, activeTab === 'people' && styles.activeTab]}>People</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('groups')}>
          <Text style={[styles.tabText, activeTab === 'groups' && styles.activeTab]}>Groups</Text>
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={{ paddingHorizontal: 16 }}>
        <TextInput
          style={styles.searchInput}
          placeholder={`Search ${activeTab === 'people' ? 'people' : 'groups'}...`}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Content */}
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {activeTab === 'people' ? (
          filteredUsers.length === 0 ? (
            <Text style={{ margin: 16, color: '#555' }}>No users to chat with.</Text>
          ) : (
            <FlatList
              data={filteredUsers}
              keyExtractor={(item) => item.user_id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => handleStartPrivateChat(item.username, item.user_id)}>
                  <View style={styles.listItem}>
                    <Image
                      source={{
                        uri: item.profile_picture
                          ? item.profile_picture.startsWith('http')
                            ? item.profile_picture
                            : `${BASE_URL}${item.profile_picture}`
                          : 'https://placehold.co/100x100',
                      }}
                      style={styles.profileImage}
                    />
                    <Text style={styles.username}>{item.username}</Text>
                  </View>
                </TouchableOpacity>
              )}
              scrollEnabled={false}
            />
          )
        ) : (
          filteredGroups.length === 0 ? (
            <Text style={{ margin: 16, color: '#555' }}>No groups joined.</Text>
          ) : (
            <FlatList
              data={filteredGroups}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => handleOpenGroupChat(item.id, item.name)}>
                  <View style={styles.listItem}>
                    <View style={styles.groupCircle}>
                      <Text style={styles.groupInitial}>{item.name[0]}</Text>
                    </View>
                    <Text style={styles.username}>{item.name}</Text>
                  </View>
                </TouchableOpacity>
              )}
              scrollEnabled={false}
            />
          )
        )}
      </ScrollView>

      {/* Plus Button */}
      {activeTab === 'groups' && (
        <TouchableOpacity
          style={styles.plusButton}
          onPress={() => navigation.navigate('CreateGroup')}
        >
          <Icon name="plus" size={30} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tabRow: { flexDirection: 'row', justifyContent: 'space-evenly', marginVertical: 10 },
  tabText: { fontSize: 18, marginHorizontal: 20, color: '#555' },
  activeTab: { fontWeight: 'bold', color: '#007AFF', textDecorationLine: 'underline' },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  groupCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#d3d3d3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  groupInitial: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  username: { fontSize: 16, fontWeight: 'bold' },
  plusButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#FF6347', // Tomato color for the button
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
});
