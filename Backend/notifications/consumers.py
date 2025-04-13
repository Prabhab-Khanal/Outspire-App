import json
from channels.generic.websocket import AsyncWebsocketConsumer
from .models import Notification
from channels.db import database_sync_to_async

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Create a unique room for the user based on their username or ID
        self.user = self.scope['user']
        self.room_name = f'notifications_{self.user.username}'
        self.room_group_name = f'notifications_{self.user.username}'

        # Join the notifications group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        # Leave the notifications group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        # Receive a message from WebSocket
        text_data_json = json.loads(text_data)
        message = text_data_json['message']
        user = text_data_json['user']

        # Save the notification to the database
        notification = await database_sync_to_async(Notification.objects.create)(
            user=user,
            message=message
        )

        # Send notification to WebSocket group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'send_notification',
                'message': message,
                'user': user,
            }
        )

    async def send_notification(self, event):
        message = event['message']
        user = event['user']

        # Send the message to WebSocket
        await self.send(text_data=json.dumps({
            'message': message,
            'user': user,
        }))
