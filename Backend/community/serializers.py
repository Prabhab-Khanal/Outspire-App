from rest_framework import serializers
from .models import Post, PostImage, Like, Comment

# Serializer for the PostImage model
class PostImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostImage
        fields = ['id', 'image']

# Serializer for the Post model
class PostSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()  # Display the user's username instead of ID
    likes = serializers.IntegerField(source='likes.count', read_only=True)  # Count of likes
    comments = serializers.IntegerField(source='comments.count', read_only=True)  # Count of comments
    images = PostImageSerializer(many=True, read_only=True)  # Include all images for the post

    class Meta:
        model = Post
        fields = ['id', 'user', 'content', 'created_at', 'likes', 'comments', 'images']

# Serializer for the Like model
class LikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Like
        fields = ['id', 'user', 'post', 'created_at']

# Serializer for the Comment model
class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ['id', 'user', 'post', 'content', 'created_at']
