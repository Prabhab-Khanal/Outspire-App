import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from .models import Message, GroupMessage, ChatGroup

User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'chat_{self.room_name}'

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data.get('message')
        sender_user_id = data.get('sender_user_id')
        receiver_user_id = data.get('receiver_user_id')  # private chat
        group_id = data.get('group_id')  # group chat

        if not message or not sender_user_id:
            await self.send(text_data=json.dumps({"error": "Invalid data."}))
            return

        try:
            sender = await self.get_user(sender_user_id)
        except User.DoesNotExist:
            await self.send(text_data=json.dumps({"error": "Sender not found."}))
            return

        if group_id:
            # Group Chat
            try:
                group = await self.get_group(group_id)
            except ChatGroup.DoesNotExist:
                await self.send(text_data=json.dumps({"error": "Group not found."}))
                return

            await self.save_group_message(group, sender, message)

            # Broadcast inside group room
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': message,
                    'sender_username': sender.username,
                    'sender_user_id': sender.user_id,
                }
            )

        elif receiver_user_id:
            # Private Chat
            try:
                receiver = await self.get_user(receiver_user_id)
            except User.DoesNotExist:
                await self.send(text_data=json.dumps({"error": "Receiver not found."}))
                return

            await self.save_private_message(sender, receiver, message)

            # 🔥 Important: Broadcast to both sender and receiver's room
            await self.channel_layer.group_send(
                f'chat_user_{sender.username}_{receiver.username}',
                {
                    'type': 'chat_message',
                    'message': message,
                    'sender_username': sender.username,
                    'sender_user_id': sender.user_id,
                }
            )
            await self.channel_layer.group_send(
                f'chat_user_{receiver.username}_{sender.username}',
                {
                    'type': 'chat_message',
                    'message': message,
                    'sender_username': sender.username,
                    'sender_user_id': sender.user_id,
                }
            )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'message': event['message'],
            'sender_username': event['sender_username'],
            'sender_user_id': event['sender_user_id'],
        }))

    # --- Helpers (DB side) ---
    @database_sync_to_async
    def get_user(self, user_id):
        return User.objects.get(user_id=user_id)

    @database_sync_to_async
    def get_group(self, group_id):
        return ChatGroup.objects.get(id=group_id)

    @database_sync_to_async
    def save_private_message(self, sender, receiver, text):
        return Message.objects.create(sender=sender, receiver=receiver, text=text)

    @database_sync_to_async
    def save_group_message(self, group, sender, text):
        return GroupMessage.objects.create(group=group, sender=sender, text=text)




# chats/consumers/group_consumer.py

import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from chats.models import GroupMessage, ChatGroup

User = get_user_model()

class GroupChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'group_{self.room_name}'
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data['message']
        sender_user_id = data['sender_user_id']
        group_id = data['group_id']

        sender = await self.get_user(sender_user_id)
        group = await self.get_group(group_id)

        await self.save_group_message(group, sender, message)

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message,
                'sender_username': sender.username,
                'sender_user_id': sender.user_id,
            }
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event))

    @database_sync_to_async
    def get_user(self, user_id):
        return User.objects.get(user_id=user_id)

    @database_sync_to_async
    def get_group(self, group_id):
        return ChatGroup.objects.get(id=group_id)

    @database_sync_to_async
    def save_group_message(self, group, sender, text):
        return GroupMessage.objects.create(group=group, sender=sender, text=text)
