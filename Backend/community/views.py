from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from .models import CommunityPost, PostImage, PostComment, PostLike
from .serializers import (
    CommunityPostSerializer, PostImageSerializer, PostCommentSerializer, PostLikeSerializer
)


class CommunityPostViewSet(viewsets.ModelViewSet):
    queryset = CommunityPost.objects.all().order_by('-created_at')
    serializer_class = CommunityPostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        post = serializer.save(user=self.request.user)
        for image in self.request.FILES.getlist('images'):
            PostImage.objects.create(post=post, image=image)

    @action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        post = get_object_or_404(CommunityPost, pk=pk)
        like, created = PostLike.objects.get_or_create(user=request.user, post=post)
        if not created:
            like.delete()
            return Response({'message': 'Like removed.'}, status=status.HTTP_200_OK)
        return Response({'message': 'Post liked.'}, status=status.HTTP_201_CREATED)


class PostCommentViewSet(viewsets.ModelViewSet):
    serializer_class = PostCommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        post_id = self.kwargs['post_id']
        return PostComment.objects.filter(post_id=post_id).order_by('created_at')

    def perform_create(self, serializer):
        post_id = self.kwargs['post_id']
        serializer.save(user=self.request.user, post_id=post_id)
