from rest_framework import serializers
from .models import CommunityPost, PostImage, PostComment, PostLike


class PostImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostImage
        fields = ['id', 'image']


class PostCommentSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = PostComment
        fields = ['id', 'user', 'comment', 'created_at']


class PostLikeSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = PostLike
        fields = ['id', 'user', 'created_at']


class CommunityPostSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    images = PostImageSerializer(many=True, read_only=True)
    comments_count = serializers.SerializerMethodField()
    likes_count = serializers.SerializerMethodField()

    class Meta:
        model = CommunityPost
        fields = ['id', 'user', 'caption', 'location', 'created_at', 'images', 'comments_count', 'likes_count']

    def get_comments_count(self, obj):
        return obj.comments.count()

    def get_likes_count(self, obj):
        return obj.likes.count()


