import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const posts = [
  {
    id: '1',
    user: {
      name: 'Samrat',
      avatar: require('../../assets/images/profile.png'),
      location: 'Khumbu Region, Nepal',
    },
    image: require('../../assets/images/everest.jpeg'),
    caption: 'Everest Base Camp was wild! The journey was challenging but absolutely worth every step.',
    likes: 45,
    timeAgo: '2 hours ago',
    comments: [
      { id: 'c1', user: 'Alex', text: 'So cool! The view is breathtaking!' },
      { id: 'c2', user: 'Nina', text: 'On my bucket list! How was the altitude?' },
    ],
  },
  {
    id: '2',
    user: {
      name: 'Aadesh',
      avatar: require('../../assets/images/profile.png'),
      location: 'Langtang National Park',
    },
    image: require('../../assets/images/langtang.jpeg'),
    caption: 'Langtang Valley was peaceful. Found the serenity I was looking for away from city life.',
    likes: 28,
    timeAgo: '6 hours ago',
    comments: [
      { id: 'c1', user: 'Lina', text: 'Great shot! The colors are amazing.' },
    ],
  },
];

export default function CommunityScreen({ navigation }) {
  const [likedPosts, setLikedPosts] = useState([]);
  const [heartAnimations] = useState({});

  // Initialize animations for each post
  useEffect(() => {
    posts.forEach(post => {
      heartAnimations[post.id] = new Animated.Value(0);
    });
  }, []);

  const toggleLike = (postId) => {
    const isCurrentlyLiked = likedPosts.includes(postId);
    
    // Update liked posts state
    setLikedPosts((prev) =>
      isCurrentlyLiked ? prev.filter((id) => id !== postId) : [...prev, postId]
    );
    
    // Animate heart if liking (not unliking)
    if (!isCurrentlyLiked) {
      Animated.sequence([
        Animated.timing(heartAnimations[postId], {
          toValue: 1.3,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(heartAnimations[postId], {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      // Reset animation value when unliking
      heartAnimations[postId].setValue(0);
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Explore</Text>
      <TouchableOpacity>
        <Icon name="message-outline" size={24} color="#333" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => {
          const isLiked = likedPosts.includes(item.id);
          const heartScale = heartAnimations[item.id] || new Animated.Value(0);

          return (
            <View style={styles.card}>
              {/* User Info */}
              <View style={styles.userRow}>
                <Image source={item.user.avatar} style={styles.avatar} />
                <View style={styles.userInfo}>
                  <Text style={styles.username}>{item.user.name}</Text>
                  <Text style={styles.location}>{item.user.location}</Text>
                </View>
                <TouchableOpacity style={styles.moreButton}>
                  <Icon name="dots-horizontal" size={20} color="#555" />
                </TouchableOpacity>
              </View>

              {/* Post Image */}
              <View style={styles.imageContainer}>
                <Image source={item.image} style={styles.postImage} />
                
                {/* Optional: Add a subtle gradient overlay for better text contrast */}
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.3)']}
                  style={styles.imageGradient}
                />
              </View>

              {/* Action Buttons */}
              <View style={styles.actions}>
                <View style={styles.leftActions}>
                  <TouchableOpacity 
                    onPress={() => toggleLike(item.id)}
                    activeOpacity={0.7}
                    style={styles.actionButton}
                  >
                    <Animated.View style={{ transform: [{ scale: isLiked ? heartScale.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.3]
                    }) : 1 }] }}>
                      <Icon
                        name={isLiked ? 'heart' : 'heart-outline'}
                        size={26}
                        color={isLiked ? '#FF3B5C' : '#333'}
                      />
                    </Animated.View>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    onPress={() => navigation.navigate('PostDetails', { post: item })}
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
                {isLiked ? item.likes + 1 : item.likes} likes
              </Text>

              {/* Caption */}
              <View style={styles.captionContainer}>
                <Text style={styles.captionUsername}>{item.user.name}</Text>
                <Text style={styles.captionText}>{item.caption}</Text>
              </View>

              {/* Show Preview Comments */}
              <View style={styles.commentsContainer}>
                {item.comments.slice(0, 2).map((comment) => (
                  <View key={comment.id} style={styles.commentRow}>
                    <Text style={styles.commentUser}>{comment.user}</Text>
                    <Text style={styles.commentText}>{comment.text}</Text>
                  </View>
                ))}
              </View>

              {/* View all comments */}
              <TouchableOpacity
                onPress={() => navigation.navigate('PostDetails', { post: item })}
                style={styles.viewCommentsButton}
              >
                <Text style={styles.viewComments}>
                  View all comments
                </Text>
              </TouchableOpacity>
              
              {/* Time ago */}
              <Text style={styles.timeAgo}>{item.timeAgo}</Text>
            </View>
          );
        }}
      />
    </View>
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
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
  },
  listContainer: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: 'white',
    marginBottom: 12,
    overflow: 'hidden',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
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
  moreButton: {
    padding: 4,
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
  },
  captionContainer: {
    paddingHorizontal: 16,
    marginTop: 6,
    flexDirection: 'row',
  },
  captionUsername: {
    fontWeight: '600',
    fontSize: 14,
    marginRight: 6,
  },
  captionText: {
    fontSize: 14,
    flex: 1,
  },
  commentsContainer: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  commentRow: {
    flexDirection: 'row',
    marginVertical: 2,
  },
  commentUser: { 
    fontWeight: '600',
    fontSize: 14,
    marginRight: 6,
  },
  commentText: {
    fontSize: 14,
    flex: 1,
  },
  viewCommentsButton: {
    paddingHorizontal: 16,
    marginTop: 6,
  },
  viewComments: {
    fontSize: 14,
    color: '#8E8E8E',
  },
  timeAgo: {
    fontSize: 12,
    color: '#8E8E8E',
    marginTop: 6,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
});