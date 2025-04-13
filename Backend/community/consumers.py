import json
from channels.generic.websocket import AsyncWebsocketConsumer
from .models import Post, Like, Comment
from channels.db import database_sync_to_async

class PostConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # This will create a unique group for the community feed
        self.room_group_name = 'community_feed'

        # Join the community feed group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        # Leave the community feed group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # Receive message from WebSocket (like or comment)
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        action = text_data_json['action']
        post_id = text_data_json['post_id']
        content = text_data_json.get('content', '')

        if action == 'like':
            # Like post
            post = await database_sync_to_async(Post.objects.get)(id=post_id)
            await database_sync_to_async(Like.objects.create)(user=self.scope['user'], post=post)

            # Broadcast like to group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'post_action',
                    'action': 'like',
                    'post_id': post.id,
                    'user': self.scope['user'].username,
                }
            )
        
        elif action == 'comment':
            # Comment on post
            post = await database_sync_to_async(Post.objects.get)(id=post_id)
            comment = await database_sync_to_async(Comment.objects.create)(user=self.scope['user'], post=post, content=content)

            # Broadcast comment to group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'post_action',
                    'action': 'comment',
                    'post_id': post.id,
                    'content': content,
                    'user': self.scope['user'].username,
                }
            )

    # Receive post actions (like/comment) from group
    async def post_action(self, event):
        action = event['action']
        post_id = event['post_id']
        user = event['user']
        content = event.get('content', '')

        # Send the action to WebSocket
        await self.send(text_data=json.dumps({
            'action': action,
            'post_id': post_id,
            'user': user,
            'content': content,
        }))
