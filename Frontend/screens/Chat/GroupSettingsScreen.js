import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Image } from 'react-native';
import { getGroupMembers, leaveGroup } from '../../services/chatService'; // Import leaveGroup also
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { BASE_URL } from '../../services/api';

export default function GroupSettingsScreen({ route, navigation }) {
  const { groupId, groupName } = route.params;

  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await getGroupMembers(groupId);
      console.log('Group Members: ', res.data)
      setMembers(res); // API should return list of { username, profile_picture }
    } catch (err) {
      console.error('Error fetching group members:', err);
      Alert.alert('Error', 'Failed to load members.');
    } finally {
      setLoading(false);
    }
  };

  const handleNavigateAddMembers = () => {
    navigation.navigate('AddMembers', { groupId });
  };

  const handleNavigateRenameGroup = () => {
    navigation.navigate('RenameGroup', { groupId, groupName });
  };

  const handleLeaveGroup = async () => {
    Alert.alert(
      "Confirm Leave",
      "Are you sure you want to leave this group?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Leave",
          style: "destructive",
          onPress: async () => {
            try {
              await leaveGroup(groupId);
              Alert.alert('Left Group', 'You have left the group.');
              navigation.navigate('Chat'); // Navigate back to chats
            } catch (err) {
              console.error('Error leaving group:', err);
              Alert.alert('Error', 'Failed to leave the group.');
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{groupName} </Text>

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 20 }} />
      ) : (
        <>
          {/* Add Members Option */}
          <TouchableOpacity style={styles.optionButton} onPress={handleNavigateAddMembers}>
            <Icon name="account-plus" size={24} color="#007AFF" />
            <Text style={styles.optionText}>Add Members</Text>
          </TouchableOpacity>

          {/* Rename Group Option */}
          <TouchableOpacity style={styles.optionButton} onPress={handleNavigateRenameGroup}>
            <Icon name="pencil" size={24} color="#007AFF" />
            <Text style={styles.optionText}>Rename Group</Text>
          </TouchableOpacity>

          {/* Group Members Section */}
          <Text style={styles.subtitle}>Group Members:</Text>

          <FlatList
            data={members}
            keyExtractor={(item) => item.username}
            renderItem={({ item }) => (
              <View style={styles.memberRow}>
                <Image
                  source={{
                    uri: item.profile_picture
                      ? item.profile_picture.startsWith('http')
                        ? item.profile_picture
                        : `${BASE_URL}${item.profile_picture}`
                      : 'https://placehold.co/100x100'
                  }}
                  style={styles.memberImage}
                />
                <Text style={styles.memberName}>{item.username}</Text>
              </View>
            )}
            ListEmptyComponent={<Text style={{ marginTop: 10 }}>No members yet.</Text>}
            scrollEnabled={false}
          />

          {/* Leave Group Button */}
          <TouchableOpacity style={styles.leaveButton} onPress={handleLeaveGroup}>
            <Text style={styles.leaveButtonText}>Leave Group</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  subtitle: { fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 10, color: '#333' },
  optionButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderColor: '#eee' },
  optionText: { fontSize: 16, marginLeft: 12, color: '#007AFF' },
  memberRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  memberImage: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  memberName: { fontSize: 16, color: '#333' },
  leaveButton: {
    marginTop: 30,
    paddingVertical: 15,
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    alignItems: 'center',
  },
  leaveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
