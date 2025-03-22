import React, { useState } from 'react';
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
} from 'react-native';

export default function PostDetailsScreen({ route }) {
  const { post } = route.params;
  const [comments, setComments] = useState(post.comments || []);
  const [newComment, setNewComment] = useState('');

  const handleAddComment = () => {
    if (newComment.trim()) {
      const updatedComments = [
        ...comments,
        {
          id: `c${comments.length + 1}`,
          user: 'You',
          text: newComment,
        },
      ];
      setComments(updatedComments);
      setNewComment('');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      {/* Post Header */}
      <View style={styles.postHeader}>
        <Image source={post.user.avatar} style={styles.avatar} />
        <Text style={styles.username}>{post.user.name}</Text>
      </View>

      {/* Post Image */}
      <Image source={post.image} style={styles.postImage} />

      {/* Caption */}
      <Text style={styles.caption}>
        <Text style={styles.username}>{post.user.name} </Text>
        {post.caption}
      </Text>

      {/* Comments Section */}
      <Text style={styles.commentsTitle}>Comments</Text>
      <FlatList
        data={comments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Text style={styles.comment}>
            <Text style={styles.commentUser}>{item.user}:</Text> {item.text}
          </Text>
        )}
        style={styles.commentsList}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      {/* Add Comment */}
      <View style={styles.commentInputRow}>
        <TextInput
          placeholder="Add a comment..."
          value={newComment}
          onChangeText={setNewComment}
          style={styles.commentInput}
        />
        <TouchableOpacity onPress={handleAddComment}>
          <Text style={styles.postBtn}>Post</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 15 },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  username: { fontWeight: 'bold', fontSize: 14 },
  postImage: { width: '100%', height: 250, borderRadius: 10, marginVertical: 10 },
  caption: { fontSize: 13, marginBottom: 15 },
  commentsTitle: { fontSize: 15, fontWeight: 'bold', marginBottom: 8 },
  commentsList: { flexGrow: 0 },
  comment: { fontSize: 13, marginBottom: 6 },
  commentUser: { fontWeight: 'bold' },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#ddd',
    paddingTop: 10,
    marginTop: 10,
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#f2f2f2',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    fontSize: 13,
    marginRight: 10,
  },
  postBtn: { color: '#007bff', fontWeight: 'bold', fontSize: 13 },
});
