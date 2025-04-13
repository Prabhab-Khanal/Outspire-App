from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Post, PostImage, Like, Comment
from .serializers import PostSerializer, LikeSerializer, CommentSerializer

class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all().order_by('-created_at')
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        # Automatically associate the post with the current user
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        post = self.get_object()
        like, created = Like.objects.get_or_create(user=request.user, post=post)
        if created:
            return Response({"message": "Liked"})
        else:
            return Response({"message": "Already liked"})

    @action(detail=True, methods=['post'])
    def comment(self, request, pk=None):
        post = self.get_object()
        content = request.data.get('content')
        comment = Comment.objects.create(user=request.user, post=post, content=content)
        return Response(CommentSerializer(comment).data)

    @action(detail=True, methods=['post'])
    def report(self, request, pk=None):
        post = self.get_object()
        post.reported = True
        post.save()
        return Response({"message": "Post reported"})

    @action(detail=True, methods=['delete'])
    def delete(self, request, pk=None):
        post = self.get_object()
        if post.user == request.user:
            post.delete()
            return Response({"message": "Post deleted"})
        else:
            return Response({"message": "Unauthorized"}, status=403)

    @action(detail=False, methods=['get'])
    def followers_posts(self, request):
        # Get posts from users the current user is following
        user = request.user
        following_users = user.following.all()  # Assuming you have a following model for users
        posts = Post.objects.filter(user__in=following_users)
        return Response(PostSerializer(posts, many=True).data)

    @action(detail=False, methods=['get'])
    def nearby_posts(self, request):
        # Get posts from nearby users (e.g., using latitude and longitude for proximity)
        # Placeholder: Filter by location-based data
        user_location = request.user.profile.location  # Assuming user has location
        nearby_posts = Post.objects.filter(user__profile__location__nearby(user_location))
        return Response(PostSerializer(nearby_posts, many=True).data)
