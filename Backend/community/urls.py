from django.urls import path
from .views import (
    GetSinglePostAPIView,
    PostListAPIView,
    PostCreateAPIView,
    PostImageUploadView,
)

urlpatterns = [
    # 📚 List all posts (GET)
    path('posts/', PostListAPIView.as_view(), name='post-list'),

    # 📝 Create a new post (POST)
    path('posts/create/', PostCreateAPIView.as_view(), name='post-create'),

    # 📷 Upload images for a post (POST)
    path('posts/<int:post_id>/upload-image/', PostImageUploadView.as_view(), name='post-image-upload'),

    path('post/<int:post_id>/', GetSinglePostAPIView.as_view(), name='get_single_post'),
]
