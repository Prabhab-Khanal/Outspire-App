from rest_framework import serializers
from .models import Post, PostImage, Comment
from users.models import User  # Assuming you have User

# 📷 PostImage Serializer
class PostImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostImage
        fields = ['id', 'image', 'uploaded_at']


# 💬 Comment Serializer
class CommentSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ['id', 'user', 'text', 'created_at']

    def get_user(self, obj):
        return {
            "username": obj.user.username,
            "profile_picture": obj.user.profile_picture.url if obj.user.profile_picture else None
        }


# 📚 Post Serializer (GET)
class PostSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()
    images = PostImageSerializer(source='post_images', many=True, read_only=True)
    likes_count = serializers.IntegerField(read_only=True)
    comments_count = serializers.IntegerField(read_only=True)
    comments = CommentSerializer(many=True, read_only=True)   
    liked_by_user = serializers.SerializerMethodField()  # <--- ADD THIS LINE

    class Meta:
        model = Post
        fields = [
            'id',
            'user',
            'caption',
            'location',
            'created_at',
            'images',
            'likes_count',
            'comments_count',
            'comments',
            'liked_by_user',
        ]

    def get_user(self, obj):
        return {
            "username": obj.user.username,
            "profile_picture": obj.user.profile_picture.url if obj.user.profile_picture else None
        }
    def get_liked_by_user(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(user_id=request.user.user_id).exists()
        return False


# 📝 Post Create Serializer (POST new post)
class PostCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ['caption', 'location']
