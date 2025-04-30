from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/privatechat/(?P<room_name>[\w_]+)/$', consumers.ChatConsumer.as_asgi()),
    re_path(r'ws/groupchat/(?P<room_name>[\w_]+)/$', consumers.GroupChatConsumer.as_asgi()),
]
