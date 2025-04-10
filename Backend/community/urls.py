from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CommunityPostViewSet, PostCommentViewSet

router = DefaultRouter()
router.register(r'posts', CommunityPostViewSet, basename='community-post')

urlpatterns = [
    path('', include(router.urls)),

    # Comment endpoints per post
    path('posts/<int:post_id>/comments/', PostCommentViewSet.as_view({'get': 'list', 'post': 'create'})),
]
