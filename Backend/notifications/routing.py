from django.urls import path
from . import consumers

# WebSocket URL routing for notifications
websocket_urlpatterns = [
    path('ws/notifications/', consumers.NotificationConsumer.as_asgi()),  # WebSocket URL for notifications
]
