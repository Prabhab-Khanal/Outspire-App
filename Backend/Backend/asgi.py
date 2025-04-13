import os
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.core.asgi import get_asgi_application
from community.routing import websocket_urlpatterns as community_ws_urls  # WebSocket routing from the community app
from chats.routing import websocket_urlpatterns as chats_ws_urls  # WebSocket routing from the chats app
from notifications.routing import websocket_urlpatterns as notifications_ws_urls  # WebSocket routing for notifications

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Backend.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),  # Handle HTTP requests
    "websocket": AuthMiddlewareStack(
        URLRouter(
            community_ws_urls + chats_ws_urls + notifications_ws_urls  # Combine community, chats, and notifications WebSocket URL patterns
        )
    ),
})
