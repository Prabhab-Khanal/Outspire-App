import os
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Backend.settings')

import django
django.setup()

from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from community.routing import websocket_urlpatterns as community_websocket
from chats.routing import websocket_urlpatterns as chats_websocket

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            community_websocket + chats_websocket  
        )
    ),
})
