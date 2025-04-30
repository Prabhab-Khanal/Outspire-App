import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { getFollowedUsers } from '../../services/communityService';
import { createGroup } from '../../services/chatService';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function CreateGroupScreen({ navigation }) {
  const [groupName, setGroupName] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]); // ✅ now using user_id
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await getFollowedUsers();
      console.log('Followed Users:', res);
      setUsers(res);
    } catch (error) {
      console.error('Error fetching followed users:', error);
      Alert.alert('Error', 'Failed to load followed users.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectUser = (user) => {
    setSelectedUserIds(prev =>
      prev.includes(user.user_id)
        ? prev.filter(id => id !== user.user_id)
        : [...prev, user.user_id]
    );
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert('Error', 'Group name cannot be empty.');
      return;
    }
    if (selectedUserIds.length === 0) {
      Alert.alert('Error', 'Select at least one member.');
      return;
    }

    console.log('Selected User IDs:', selectedUserIds);
    console.log('Group Name:', groupName);

    try {
      const res = await createGroup(groupName, selectedUserIds);  // ✅ sending IDs
      console.log('Group created:', res.data);
      const createdGroup = res.data;

      Alert.alert('Success', 'Group created successfully!');
      navigation.replace('GroupChatRoom', {
        groupId: createdGroup.id,
        groupName: createdGroup.name,
      });

    } catch (error) {
      console.error('Error creating group:', error);
      Alert.alert('Error', 'Failed to create group.');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 50 }} size="large" color="#007AFF" />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 50 }}>
        <Text style={styles.label}>Group Name:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter group name"
          value={groupName}
          onChangeText={setGroupName}
        />

        <Text style={styles.label}>Select Members:</Text>
        <FlatList
          data={users}
          keyExtractor={(item) => item.username}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.userRow}
              onPress={() => toggleSelectUser(item)}
            >
              <View style={[
                styles.checkbox,
                selectedUserIds.includes(item.user_id) && styles.checkboxSelected
              ]} />
              <Text style={styles.username}>{item.username}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={{ margin: 16, color: '#555' }}>No followed users available.</Text>}
          scrollEnabled={false}
        />

        <TouchableOpacity style={styles.button} onPress={handleCreateGroup} disabled={creating}>
          <Text style={styles.buttonText}>{creating ? 'Creating...' : 'Create Group'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 20, paddingTop: 20 },
  label: { fontSize: 18, fontWeight: 'bold', marginBottom: 8, color: '#333' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 20 },
  userRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  checkbox: { width: 20, height: 20, borderWidth: 1, borderColor: '#333', marginRight: 12, borderRadius: 4 },
  checkboxSelected: { backgroundColor: '#007AFF' },
  username: { fontSize: 16, color: '#333' },
  button: { marginTop: 20, backgroundColor: '#007AFF', padding: 15, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
