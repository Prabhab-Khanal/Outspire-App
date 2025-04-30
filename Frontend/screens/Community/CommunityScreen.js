import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, FlatList, Image, TouchableOpacity,
  StyleSheet, TextInput, ActivityIndicator, Alert, RefreshControl, Dimensions
} from 'react-native';
import { getAllPosts, getPeopleList, connectCommunityWebSocket } from '../../services/communityService';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage'; // for token if needed
import { BASE_URL } from '../../services/api'; 

const { width } = Dimensions.get('window');

export default function CommunityScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('Posts');
  const [searchQuery, setSearchQuery] = useState('');
  const [peopleList, setPeopleList] = useState([]);
  const [postsList, setPostsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

  const ws = useRef(null);

  useEffect(() => {
    if (activeTab === 'Posts') {
      connectWS();
    }
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [activeTab]);


  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const userInfo = await AsyncStorage.getItem('user');
        if (userInfo) {
          const parsed = JSON.parse(userInfo);
          setIsPremium(!!parsed.premium); // convert to boolean safely
        }
      } catch (err) {
        console.error('Error fetching user info:', err);
      }
    };
    fetchUserInfo();
  }, []);
  
  


  const connectWS = async () => {
    ws.current = await connectCommunityWebSocket(
      (data) => {
        if (data.type === 'post_update') {
          updatePostLikes(data.post_id, data.likes_count, data.liked);
        } else if (data.type === 'new_comment') {
          addNewComment(data.post_id, data.comment);
        }
      },
      (e) => {
        console.error('WebSocket Error:', e.message);
      }
    );
  };

  const updatePostLikes = (postId, likesCount, liked) => {
    setPostsList((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId ? { ...post, likes_count: likesCount, liked_by_user: liked } : post
      )
    );
  };

  const addNewComment = (postId, newComment) => {
    setPostsList((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? { ...post, comments: [...(post.comments || []), newComment] }
          : post
      )
    );
  };

  const handleLike = (postId) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(
        JSON.stringify({ action: 'like', post_id: postId })
      );
    } else {
      Alert.alert('Connection Error', 'WebSocket not connected. Reconnecting...');
      connectWS();
    }
  };

  useEffect(() => {
    if (activeTab === 'People') {
      fetchPeopleList();
    } else if (activeTab === 'Posts') {
      fetchPostsList();
    }
  }, [searchQuery, activeTab]);

  const fetchPeopleList = async () => {
    setLoading(true);
    try {
      const response = await getPeopleList(searchQuery);
      console.log('People List: ',response.data.filter(user => user.is_premium))
      setPeopleList(response.data.filter(user => user.is_premium));

    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPostsList = async () => {
    setLoading(true);
    try {
      const response = await getAllPosts();
      console.log('posts: ', response.data)
      setPostsList(response.data);
    } catch (err) {
      console.error('Failed to load posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPostsList().then(() => setRefreshing(false));
  }, []);

  const renderTabHeader = () => (
    <View style={styles.tabHeader}>
      {['Posts', 'People'].map(tab => (
        <TouchableOpacity
          key={tab}
          style={[styles.tabItem, activeTab === tab && styles.activeTab]}
          onPress={() => {
            if (tab === 'People' && !isPremium) {
              Alert.alert('Premium Feature', 'Upgrade to Premium to access this tab.');
              return;
            }
            setActiveTab(tab);
          }}
          
        >
          <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
            {tab}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderPostItem = ({ item }) => (
  <TouchableOpacity
    onPress={() => navigation.navigate('PostDetails', { postId: item.id })}
    activeOpacity={0.8}
    style={styles.postCard}
  >
    {/* Top Section: Profile + Location */}
    <View style={styles.profileRow}>
    <Image
        source={{
          uri: item.user?.profile_picture
            ? item.user.profile_picture.startsWith('http')
              ? item.user.profile_picture
              : `${BASE_URL}${item.user.profile_picture}`
            : 'https://placehold.co/50x50'
        }}
        style={styles.profilePicture}
      />
      <View>
        <Text style={styles.usernameText}>{item.user?.username || 'Unknown'}</Text>
        <Text style={styles.locationText}>{item.location || 'Unknown Location'}</Text>
      </View>
    </View>

    {/* Caption */}
    <Text style={styles.caption}>{item.caption}</Text>

    {/* Post Image */}
    {item.images?.length > 0 && (
      <Image
        source={{ uri: item.images[0]?.image }}
        style={styles.postImage}
      />
    )}

    {/* Like and Comment Icons */}
    <View style={styles.actionsRow}>
      <TouchableOpacity onPress={() => handleLike(item.id)}>
        <Icon name={item.liked_by_user ? 'heart' : 'heart-outline'} size={26} color="#E9446A" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('PostDetails', { postId: item.id })}>
        <Icon name="comment-outline" size={26} color="#000" style={{ marginLeft: 16 }} />
      </TouchableOpacity>
    </View>

    {/* Likes Count */}
    <Text style={styles.likesText}>{item.likes_count || 0} likes</Text>

    {/* Comment Preview */}
    {item.comments?.slice(0, 2).map((comment, idx) => (
      <Text key={idx} style={styles.commentText}>
        <Text style={{ fontWeight: 'bold' }}>{comment.user.username}: </Text>
        {comment.text}
      </Text>
    ))}
  </TouchableOpacity>
);


  const renderPeopleItem = ({ item }) => (
    <TouchableOpacity
      style={styles.peopleCard}
      onPress={() => navigation.navigate('UserProfile', { username: item.username })}
    >
      <Image
        source={{ uri: item.profile_picture || 'https://placehold.co/100x100' }}
        style={styles.avatar}
      />
      <View>
        <Text style={styles.peopleName}>{item.first_name} {item.last_name}</Text>
        <Text style={styles.peopleUsername}>@{item.username}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {renderTabHeader()}

      {activeTab === 'People' ? (
        <>
          <TextInput
            style={styles.searchInput}
            placeholder="Search users..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {loading ? (
            <ActivityIndicator style={{ marginTop: 20 }} size="large" />
          ) : (
            <FlatList
              data={peopleList}
              keyExtractor={(item) => item.username}
              renderItem={renderPeopleItem}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          )}
        </>
      ) : (
        <>
          {loading ? (
            <ActivityIndicator style={{ marginTop: 20 }} size="large" />
          ) : (
            <FlatList
              data={postsList}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderPostItem}
              contentContainerStyle={{ paddingBottom: 20 }}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            />
          )}
        </>
      )}

      {activeTab === 'Posts' && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('AddPost')}
        >
          <Icon name="plus" size={28} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  tabHeader: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#ddd', backgroundColor: '#fff' },
  tabItem: { paddingVertical: 6 },
  tabText: { fontSize: 16, color: '#777' },
  activeTab: { borderBottomWidth: 2, borderBottomColor: '#111' },
  activeTabText: { color: '#111', fontWeight: 'bold' },
  profileRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  profilePicture: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  usernameText: { fontWeight: 'bold', fontSize: 16 },
  locationText: { fontSize: 12, color: '#777' },
  postCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 12,
    borderRadius: 12,
    elevation: 2,
    overflow: 'hidden'  // Add this
  },
  
  postImage: {
    width: '100%',        // Change from width - 32
    height: 250,
    borderRadius: 10,     // You can optionally remove this
    marginTop: 10,
    alignSelf: 'stretch'  // Optional but ensures full width
  },
  
  actionsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  likesText: { fontWeight: 'bold', marginVertical: 4 },
  caption: { fontSize: 14, marginBottom: 6 },
  commentText: { marginTop: 2, color: '#555' },
  searchInput: { margin: 16, backgroundColor: '#fff', padding: 10, borderRadius: 8, fontSize: 16, borderWidth: 1, borderColor: '#eee' },
  peopleCard: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 10, borderRadius: 10, elevation: 1 },
  avatar: { width: 45, height: 45, borderRadius: 22.5, marginRight: 12 },
  peopleName: { fontSize: 16, fontWeight: 'bold' },
  peopleUsername: { fontSize: 14, color: '#666' },
  fab: { position: 'absolute', right: 20, bottom: 30, backgroundColor: '#007AFF', width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 4 },
});
