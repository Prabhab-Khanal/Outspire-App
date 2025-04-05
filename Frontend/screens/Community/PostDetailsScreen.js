import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function PostDetailsScreen({ route, navigation }) {
  const { post } = route.params;
  const [comments, setComments] = useState(post.comments || []);
  const [newComment, setNewComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const likeAnimation = useRef(new Animated.Value(0)).current;
  const inputRef = useRef(null);

  const handleAddComment = () => {
    if (newComment.trim()) {
      const updatedComments = [
        ...comments,
        {
          id: `c${comments.length + 1}`,
          user: 'You',
          text: newComment,
          timeAgo: 'Just now'
        },
      ];
      setComments(updatedComments);
      setNewComment('');
    }
  };

  const toggleLike = () => {
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    
    if (newLikedState) {
      Animated.sequence([
        Animated.timing(likeAnimation, {
          toValue: 1.3,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(likeAnimation, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      likeAnimation.setValue(0);
    }
  };

  const focusCommentInput = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post</Text>
        <TouchableOpacity style={styles.moreButton}>
          <Icon name="dots-horizontal" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={comments}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={() => (
          <>
            {/* Post Author Info */}
            <View style={styles.postHeader}>
              <Image source={post.user.avatar} style={styles.avatar} />
              <View style={styles.userInfo}>
                <Text style={styles.username}>{post.user.name}</Text>
                {post.user.location && (
                  <Text style={styles.location}>{post.user.location}</Text>
                )}
              </View>
            </View>

            {/* Post Image */}
            <View style={styles.imageContainer}>
              <Image source={post.image} style={styles.postImage} />
              
              {/* Optional gradient overlay */}
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.2)']}
                style={styles.imageGradient}
              />
            </View>

            {/* Action Buttons */}
            <View style={styles.actions}>
              <View style={styles.leftActions}>
                <TouchableOpacity 
                  onPress={toggleLike}
                  activeOpacity={0.7}
                  style={styles.actionButton}
                >
                  <Animated.View style={{ 
                    transform: [{ 
                      scale: isLiked ? likeAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.3]
                      }) : 1 
                    }] 
                  }}>
                    <Icon
                      name={isLiked ? 'heart' : 'heart-outline'}
                      size={26}
                      color={isLiked ? '#FF3B5C' : '#333'}
                    />
                  </Animated.View>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  onPress={focusCommentInput}
                  activeOpacity={0.7}
                  style={styles.actionButton}
                >
                  <Icon name="comment-outline" size={26} color="#333" />
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
                  <Icon name="share-outline" size={26} color="#333" />
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
                <Icon name="bookmark-outline" size={26} color="#333" />
              </TouchableOpacity>
            </View>

            {/* Likes */}
            <Text style={styles.likes}>
              {isLiked ? post.likes + 1 : post.likes} likes
            </Text>

            {/* Caption */}
            <View style={styles.captionContainer}>
              <Text style={styles.captionUsername}>{post.user.name}</Text>
              <Text style={styles.captionText}>{post.caption}</Text>
            </View>
            
            {/* Time */}
            {post.timeAgo && (
              <Text style={styles.timeAgo}>{post.timeAgo}</Text>
            )}

            {/* Comments Section Header */}
            <View style={styles.commentsHeader}>
              <Text style={styles.commentsTitle}>Comments</Text>
              <Text style={styles.commentCount}>{comments.length}</Text>
            </View>
          </>
        )}
        renderItem={({ item }) => (
          <View style={styles.commentRow}>
            <View style={styles.commentAvatar}>
              <Text style={styles.avatarPlaceholder}>
                {item.user.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.commentContent}>
              <Text style={styles.commentUser}>{item.user}</Text>
              <Text style={styles.commentText}>{item.text}</Text>
              {item.timeAgo && (
                <Text style={styles.commentTime}>{item.timeAgo}</Text>
              )}
            </View>
            <TouchableOpacity style={styles.commentLike}>
              <Icon name="heart-outline" size={14} color="#999" />
            </TouchableOpacity>
          </View>
        )}
        style={styles.commentsList}
        contentContainerStyle={styles.commentsContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* Add Comment */}
      <View style={styles.commentInputContainer}>
        <View style={styles.commentInputRow}>
          <Image 
            source={post.user.avatar} 
            style={styles.commentAvatar} 
          />
          <TextInput
            ref={inputRef}
            placeholder="Add a comment..."
            value={newComment}
            onChangeText={setNewComment}
            style={styles.commentInput}
            multiline
            maxLength={300}
          />
          <TouchableOpacity 
            onPress={handleAddComment}
            disabled={!newComment.trim()}
            style={styles.postButton}
          >
            <Text style={[
              styles.postBtnText,
              !newComment.trim() && styles.disabledPostBtn
            ]}>
              Post
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  moreButton: {
    padding: 4,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'white',
  },
  avatar: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    marginRight: 10,
    borderWidth: 0.5,
    borderColor: '#EFEFEF'
  },
  userInfo: {
    flex: 1,
  },
  username: { 
    fontWeight: '600', 
    fontSize: 14, 
    color: '#111'
  },
  location: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  imageContainer: {
    width: '100%',
    height: width,
    position: 'relative',
  },
  postImage: { 
    width: '100%', 
    height: '100%',
    resizeMode: 'cover',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'white',
  },
  leftActions: {
    flexDirection: 'row',
  },
  actionButton: {
    marginRight: 16,
    padding: 2,
  },
  likes: {
    paddingHorizontal: 16,
    fontWeight: '600',
    fontSize: 14,
    color: '#111',
    backgroundColor: 'white',
    paddingBottom: 6,
  },
  captionContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  captionUsername: {
    fontWeight: '600',
    fontSize: 14,
    marginRight: 6,
  },
  captionText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  timeAgo: {
    fontSize: 12,
    color: '#8E8E8E',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: 'white',
  },
  commentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderColor: '#EFEFEF',
    marginTop: 10,
  },
  commentsTitle: { 
    fontSize: 16, 
    fontWeight: '600',
  },
  commentCount: {
    fontSize: 14,
    color: '#8E8E8E',
  },
  commentsList: { 
    flex: 1,
    backgroundColor: 'white',
  },
  commentsContainer: {
    paddingBottom: 20,
  },
  commentRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E1E1E1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarPlaceholder: {
    fontWeight: '600',
    color: '#666',
    fontSize: 14,
  },
  commentContent: {
    flex: 1,
  },
  commentUser: { 
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 2,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
  },
  commentTime: {
    fontSize: 12,
    color: '#8E8E8E',
    marginTop: 4,
  },
  commentLike: {
    padding: 4,
    marginLeft: 8,
  },
  commentInputContainer: {
    borderTopWidth: 1,
    borderTopColor: '#EFEFEF',
    backgroundColor: 'white',
    paddingVertical: 8,
  },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#F2F2F2',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginHorizontal: 10,
    fontSize: 14,
    maxHeight: 100,
  },
  postButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  postBtnText: {
    color: '#3897F0',
    fontWeight: '600',
    fontSize: 14,
  },
  disabledPostBtn: {
    color: '#C3E0FA',
  },
});