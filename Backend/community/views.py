from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated

from .models import Post, PostImage
from .serializers import PostSerializer, PostCreateSerializer, PostImageSerializer

#   List all posts
class PostListAPIView(generics.ListAPIView):
    queryset = Post.objects.all().order_by('-created_at')
    serializer_class = PostSerializer
    permission_classes = [permissions.AllowAny]  # Public community feed

#  Create a new post
class PostCreateAPIView(generics.CreateAPIView):
    serializer_class = PostCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        post = serializer.save(user=self.request.user)
        print(" Post created:", post.id)
        self.created_post = post  # Save for later use

    def create(self, request, *args, **kwargs):
        """Override to return post ID properly after creation."""
        print(" Creating post with data:", request.data)
        response = super().create(request, *args, **kwargs)
        post_id = getattr(self, 'created_post', None)

        if post_id:
            return Response({
                "id": self.created_post.id,
                "message": "Post created successfully."
            }, status=status.HTTP_201_CREATED)
        else:
            return Response({
                "error": "Post creation failed."
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# 3. Upload images to a post
class PostImageUploadView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, post_id):
        print(f" Uploading images to post ID: {post_id}")
        post = get_object_or_404(Post, id=post_id)

        if post.user != request.user:
            print(" User is not owner of the post.")
            return Response({'error': 'You are not the owner of this post.'}, status=status.HTTP_403_FORBIDDEN)

        images = request.FILES.getlist('images')

        if not images:
            print(" No images received.")
            return Response({'error': 'No images uploaded.'}, status=status.HTTP_400_BAD_REQUEST)

        for img in images:
            PostImage.objects.create(post=post, image=img)
            print(f" Image saved for post {post_id}: {img.name}")

        return Response({'message': 'Images uploaded successfully.'}, status=status.HTTP_201_CREATED)


class GetSinglePostAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, post_id):
        try:
            post = Post.objects.get(id=post_id)
            serializer = PostSerializer(post, context={"request": request})
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Post.DoesNotExist:
            return Response({"error": "Post not found"}, status=status.HTTP_404_NOT_FOUND)