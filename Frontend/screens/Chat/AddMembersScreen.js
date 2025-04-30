import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { getFollowedUsers } from '../../services/communityService';
import { addGroupMembers } from '../../services/chatService';

export default function AddMembersScreen({ route, navigation }) {
  const { groupId } = route.params;
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await getFollowedUsers();
      setUsers(res);
    } catch (error) {
      console.error('Error fetching users:', error);
      Alert.alert('Error', 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  const toggleUserSelect = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const handleAddSelectedMembers = async () => {
    if (selectedUsers.length === 0) {
      Alert.alert('Error', 'Please select at least one user.');
      return;
    }

    try {
      await addGroupMembers(groupId, selectedUsers);
      Alert.alert('Success', 'Members added successfully!');
      navigation.goBack(); // Go back to Group Settings after adding
    } catch (error) {
      console.error('Error adding members:', error);
      Alert.alert('Error', 'Failed to add members.');
    }
  };

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 50 }} size="large" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Members to Add</Text>

      <FlatList
        data={users}
        keyExtractor={(item) => item.username}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.userRow}
            onPress={() => toggleUserSelect(item.user_id)}
          >
            <View style={[
              styles.checkbox,
              selectedUsers.includes(item.user_id) && styles.checkboxSelected
            ]} />
            <Text style={styles.username}>{item.username}</Text>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleAddSelectedMembers}
      >
        <Text style={styles.buttonText}>Add Selected Members</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  userRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  checkbox: { width: 22, height: 22, borderWidth: 2, borderColor: '#007AFF', marginRight: 12, borderRadius: 4 },
  checkboxSelected: { backgroundColor: '#007AFF' },
  username: { fontSize: 16, color: '#333' },
  button: { marginTop: 20, backgroundColor: '#007AFF', padding: 15, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
