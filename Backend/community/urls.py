from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PostViewSet

# Set up the DefaultRouter
router = DefaultRouter()
router.register(r'posts', PostViewSet)  # This will automatically include the custom actions like 'like', 'comment', etc.


urlpatterns = [
    path('api/', include(router.urls)),  # API endpoint for posts and comments
]
