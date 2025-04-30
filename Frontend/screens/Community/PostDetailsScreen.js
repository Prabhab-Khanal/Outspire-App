import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, Image, TextInput, TouchableOpacity,
  FlatList, StyleSheet, KeyboardAvoidingView, Platform,
  StatusBar, Dimensions, Animated
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getPostById, connectCommunityWebSocket } from '../../services/communityService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../../services/api'; 
const { width } = Dimensions.get('window');

export default function PostDetailsScreen({ route, navigation }) {
  const { postId } = route.params;

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const scrollX = useRef(new Animated.Value(0)).current;
  const inputRef = useRef(null);
  const ws = useRef(null);

  useEffect(() => {
    fetchPost();
    connectWS();
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  const fetchPost = async () => {
    try {
      const res = await getPostById(postId);
      setPost(res);
      setComments(res.comments || []);
      setIsLiked(res.liked_by_user || false);
    } catch (err) {
      console.error('❌ Failed to load post:', err);
    }
  };

  const connectWS = async () => {
    ws.current = await connectCommunityWebSocket(
      (data) => {
        if (data.type === 'post_update' && data.post_id === postId) {
          fetchPost();
        } else if (data.type === 'new_comment' && data.post_id === postId) {
          fetchPost();
        }
      },
      (e) => console.error('❌ WebSocket Error:', e.message)
    );
  };

  const handleAddComment = () => {
    if (newComment.trim() && ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ action: 'comment', post_id: postId, text: newComment.trim() }));
      setNewComment('');
    }
  };

  const toggleLike = () => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ action: 'like', post_id: postId }));
    }
  };

  if (!post) {
    return (
      <View style={styles.centered}>
        <Text>Loading Post...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        ListHeaderComponent={() => (
          <>
            {/* Profile */}
            <View style={styles.profileRow}>
            <Image source={{
              uri: post.user?.profile_picture
                ? post.user.profile_picture.startsWith('http')
                  ? post.user.profile_picture
                  : `${BASE_URL}${post.user.profile_picture}`
                : 'https://placehold.co/50x50'
            }} style={styles.avatar} />

              <View style={{ marginLeft: 10 }}>
                <Text style={styles.username}>{post.user?.username}</Text>
                <Text style={styles.location}>{post.location || 'Unknown Location'}</Text>
              </View>
            </View>

            {/* Images Carousel */}
            <View style={{ width, height: width }}>
              <Animated.FlatList
                data={post.images}
                keyExtractor={(item, index) => index.toString()}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={Animated.event(
                  [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                  { useNativeDriver: false }
                )}
                renderItem={({ item }) => (
                  <Image source={{ uri: item.image }} style={styles.postImage} />
                )}
              />
              {/* Dots */}
              <View style={styles.dotsContainer}>
                {post.images?.map((_, index) => {
                  const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
                  const dotWidth = scrollX.interpolate({
                    inputRange,
                    outputRange: [8, 16, 8],
                    extrapolate: 'clamp',
                  });
                  const opacity = scrollX.interpolate({
                    inputRange,
                    outputRange: [0.3, 1, 0.3],
                    extrapolate: 'clamp',
                  });
                  return (
                    <Animated.View
                      key={index}
                      style={[styles.dot, { width: dotWidth, opacity }]}
                    />
                  );
                })}
              </View>
            </View>

            {/* Like + Comment */}
            <View style={styles.actionRow}>
              <TouchableOpacity onPress={toggleLike}>
                <Icon name={isLiked ? 'heart' : 'heart-outline'} size={26} color="#E9446A" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => inputRef.current?.focus()}>
                <Icon name="comment-outline" size={26} color="#000" style={{ marginLeft: 16 }} />
              </TouchableOpacity>
            </View>

            {/* Likes count */}
            <Text style={styles.likesText}>{post.likes_count || 0} likes</Text>

            {/* Caption */}
            {post.caption?.trim() !== '' && (
              <View style={styles.captionRow}>
                <Text style={styles.captionUsername}>{post.user?.username}: </Text>
                <Text style={styles.captionText}>{post.caption}</Text>
              </View>
            )}

            {/* Comments Title */}
            <View style={styles.commentsHeader}>
              <Text style={styles.commentsTitle}>Comments</Text>
            </View>
          </>
        )}
        data={comments}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.commentRow}>
            <Text style={styles.commentUsername}>{item.user.username}:</Text>
            <Text style={styles.commentText}> {item.text}</Text>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 80 }}
      />

      {/* Add Comment */}
      <View style={styles.addCommentRow}>
        <TextInput
          ref={inputRef}
          placeholder="Add a comment..."
          value={newComment}
          onChangeText={setNewComment}
          style={styles.commentInput}
        />
        <TouchableOpacity onPress={handleAddComment} disabled={!newComment.trim()}>
          <Text style={[styles.postBtn, { opacity: newComment.trim() ? 1 : 0.5 }]}>Post</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderColor: '#eee' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  profileRow: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#ccc' },
  username: { fontSize: 16, fontWeight: '600' },
  location: { fontSize: 12, color: '#666' },
  postImage: { width: width, height: width, resizeMode: 'cover' },
  dotsContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 8 },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#333',
    marginHorizontal: 4,
  },
  actionRow: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  likesText: { fontSize: 14, fontWeight: 'bold', paddingHorizontal: 16, marginBottom: 8 },
  captionRow: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 16, marginBottom: 8 },
  captionUsername: { fontWeight: 'bold', fontSize: 14 },
  captionText: { fontSize: 14, flex: 1, flexWrap: 'wrap' },
  commentsHeader: { paddingHorizontal: 16, paddingVertical: 10, borderTopWidth: 1, borderColor: '#eee' },
  commentsTitle: { fontWeight: 'bold', fontSize: 16 },
  commentRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 6 },
  commentUsername: { fontWeight: 'bold', fontSize: 14 },
  commentText: { fontSize: 14, flexShrink: 1 },
  addCommentRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderTopWidth: 1, borderColor: '#eee', position: 'absolute', bottom: 0, width: '100%', backgroundColor: '#fff' },
  commentInput: { flex: 1, backgroundColor: '#f1f1f1', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, fontSize: 14 },
  postBtn: { marginLeft: 10, fontWeight: 'bold', color: '#3897F0', fontSize: 16 },
});
