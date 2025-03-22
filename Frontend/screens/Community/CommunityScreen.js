import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const posts = [
  {
    id: '1',
    user: {
      name: 'Samrat',
      avatar: require('../../assets/images/profile.png'),
    },
    image: require('../../assets/images/everest.jpeg'),
    caption: 'Everest Base Camp was wild!',
    likes: 45,
    comments: [
      { id: 'c1', user: 'Alex', text: 'So cool!' },
      { id: 'c2', user: 'Nina', text: 'On my bucket list!' },
    ],
  },
  {
    id: '2',
    user: {
      name: 'Aadesh',
      avatar: require('../../assets/images/profile.png'),
    },
    image: require('../../assets/images/langtang.jpeg'),
    caption: 'Langtang Valley was peaceful.',
    likes: 28,
    comments: [
      { id: 'c1', user: 'Lina', text: 'Great shot!' },
    ],
  },
];

export default function CommunityScreen({ navigation }) {
  const [likedPosts, setLikedPosts] = useState([]);

  const toggleLike = (postId) => {
    setLikedPosts((prev) =>
      prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId]
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const isLiked = likedPosts.includes(item.id);

          return (
            <View style={styles.card}>
              {/* User Info */}
              <View style={styles.userRow}>
                <Image source={item.user.avatar} style={styles.avatar} />
                <Text style={styles.username}>{item.user.name}</Text>
              </View>

              {/* Post Image */}
              <Image source={item.image} style={styles.postImage} />

              {/* Action Buttons */}
              <View style={styles.actions}>
                <TouchableOpacity onPress={() => toggleLike(item.id)}>
                  <Icon
                    name={isLiked ? 'heart' : 'heart-outline'}
                    size={24}
                    color={isLiked ? 'red' : '#333'}
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('PostDetails', { post: item })}>
                  <Icon name="comment-outline" size={24} color="#333" style={{ marginLeft: 15 }} />
                </TouchableOpacity>
              </View>

              {/* Likes */}
              <Text style={styles.likes}>{isLiked ? item.likes + 1 : item.likes} likes</Text>

              {/* Caption */}
              <Text style={styles.caption}>
                <Text style={styles.username}>{item.user.name} </Text>
                {item.caption}
              </Text>

              {/* Show Preview Comments */}
              {item.comments.slice(0, 2).map((comment) => (
                <Text key={comment.id} style={styles.comment}>
                  <Text style={styles.commentUser}>{comment.user}:</Text> {comment.text}
                </Text>
              ))}

              {/* View all comments */}
              <TouchableOpacity
                onPress={() => navigation.navigate('PostDetails', { post: item })}
              >
                <Text style={styles.viewComments}>View all comments</Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f2f2', padding: 10 },
  card: {
    backgroundColor: 'white',
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 3,
    paddingBottom: 10,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  username: { fontWeight: 'bold', fontSize: 14, color: '#111' },
  postImage: { width: '100%', height: 250 },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  likes: {
    paddingHorizontal: 10,
    fontWeight: 'bold',
    marginTop: 5,
    fontSize: 13,
  },
  caption: {
    paddingHorizontal: 10,
    marginTop: 5,
    fontSize: 13,
  },
  comment: {
    paddingHorizontal: 10,
    marginTop: 4,
    fontSize: 13,
  },
  commentUser: { fontWeight: 'bold' },
  viewComments: {
    paddingHorizontal: 10,
    marginTop: 4,
    fontSize: 13,
    color: '#999',
  },
});
