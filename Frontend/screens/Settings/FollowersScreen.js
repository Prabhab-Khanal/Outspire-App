import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, ActivityIndicator,
  StyleSheet, Image, RefreshControl, TouchableOpacity, Alert
} from 'react-native';
import { getFollowedUsers, toggleFollow } from '../../services/communityService'; // ✅ Include toggleFollow
import { BASE_URL } from '../../services/api';

export default function FollowersScreen({ navigation }) {
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchFollowers();
  }, []);

  const fetchFollowers = async () => {
    try {
      setLoading(true);
      const response = await getFollowedUsers();
      // Add `isFollowing` state locally (optimistic)
      setFollowers(response.map((u) => ({ ...u, isFollowing: true })));
    } catch (err) {
      console.error('Error fetching followed users:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchFollowers();
  }, []);

  const handleUnfollow = async (username) => {
    Alert.alert(
      'Unfollow',
      `Are you sure you want to unfollow @${username}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unfollow',
          style: 'destructive',
          onPress: async () => {
            try {
              // Optimistic UI
              setFollowers(prev => prev.filter(user => user.username !== username));
              await toggleFollow(username); // backend call
            } catch (err) {
              console.error('Error unfollowing:', err);
              Alert.alert('Error', 'Failed to unfollow. Please try again.');
              fetchFollowers(); // fallback re-fetch
            }
          },
        },
      ]
    );
  };

  const renderFollower = ({ item }) => (
    <View style={styles.card}>
      <TouchableOpacity
        style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
        onPress={() => navigation.navigate('UserProfile', { username: item.username })}
      >
        <Image
          source={{
            uri: item.profile_picture
              ? item.profile_picture.startsWith('http')
                ? item.profile_picture
                : `${BASE_URL}${item.profile_picture}`
              : 'https://placehold.co/100x100',
          }}
          style={styles.avatar}
        />
        <View>
          <Text style={styles.name}>{item.first_name} {item.last_name}</Text>
          <Text style={styles.username}>@{item.username}</Text>
        </View>
      </TouchableOpacity>

      {/* Unfollow button */}
      <TouchableOpacity
        style={styles.followedButton}
        onPress={() => handleUnfollow(item.username)}
      >
        <Text style={styles.followedButtonText}>Followed ✓</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Users You Follow</Text>
      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 20 }} />
      ) : followers.length === 0 ? (
        <Text style={styles.emptyText}>You haven't followed anyone yet.</Text>
      ) : (
        <FlatList
          data={followers}
          keyExtractor={(item) => item.user_id.toString()}
          renderItem={renderFollower}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA', padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
    justifyContent: 'space-between',
  },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
  name: { fontSize: 16, fontWeight: 'bold' },
  username: { fontSize: 14, color: '#555' },
  emptyText: { textAlign: 'center', marginTop: 40, fontSize: 16, color: '#999' },
  followedButton: {
    backgroundColor: '#e0e0e0',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  followedButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
});
