import json
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from channels.db import database_sync_to_async
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth.models import AnonymousUser

from .models import Post, Comment
from users.models import User
from .serializers import CommentSerializer

# ------------------ ORM Helpers --------------------

@sync_to_async
def get_post(post_id):
    return Post.objects.get(id=post_id)

@sync_to_async
def user_has_liked(post, user):
    return post.likes.filter(pk=user.pk).exists()

@sync_to_async
def add_like(post, user):
    post.likes.add(user)

@sync_to_async
def remove_like(post, user):
    post.likes.remove(user)

@sync_to_async
def get_likes_count(post):
    return post.likes.count()

@sync_to_async
def create_comment(user, post, text):
    return Comment.objects.create(user=user, post=post, text=text)

@sync_to_async
def serialize_comment(comment):
    return CommentSerializer(comment).data

@database_sync_to_async
def get_user_from_token(token):
    try:
        access_token = AccessToken(token)
        user_id = access_token['user_id']
        print(f"🔑 Token decoded successfully. User ID found: {user_id}")
        return User.objects.get(user_id=user_id)  # <<<<<<<<<<<< FIXED here
    except Exception as e:
        print(f"❌ Error decoding token or fetching user: {str(e)}")
        raise e


# ------------------ WebSocket Consumer --------------------

class CommunityConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = "community"
        self.room_group_name = "community_group"

        print("🌐 WebSocket connection request received.")
        
        # Extract token manually
        query_string = self.scope['query_string'].decode()
        params = dict(qc.split('=') for qc in query_string.split('&') if '=' in qc)
        token = params.get('token')

        if not token:
            print("❌ No token provided in WebSocket URL. Closing connection.")
            await self.close()
            return
        
        print(f"🔍 Token received: {token}")

        try:
            user = await get_user_from_token(token)
            if not user:
                print("❌ No valid user found for token. Closing connection.")
                await self.close()
                return

            self.scope['user'] = user
            print(f"✅ User authenticated: {user.username}")
        except Exception:
            print("❌ Token invalid or user does not exist. Closing connection.")
            await self.close()
            return

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()
        print("🟢 WebSocket connection accepted.")

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        print("🔴 WebSocket disconnected.")

    async def receive(self, text_data):
        data = json.loads(text_data)
        action = data.get('action')

        user = self.scope.get("user", None)

        print(f"📩 Received action: {action}")
        print(f"👤 Current User: {user} | Authenticated: {getattr(user, 'is_authenticated', False)}")

        if not user or isinstance(user, AnonymousUser) or not user.is_authenticated:
            print("🚫 Unauthorized or anonymous user tried to perform an action. Ignoring.")
            return

        if action == 'like':
            await self.handle_like(data, user)
        elif action == 'comment':
            await self.handle_comment(data, user)
        else:
            print(f"⚠️ Unknown action type received: {action}")

    async def handle_like(self, data, user):
        post_id = data.get('post_id')
        print(f"🖱️ Like action triggered for Post ID: {post_id} by User: {user.username}")

        post = await get_post(post_id)
        if not post:
            print(f"❌ Post with ID {post_id} not found. Like action aborted.")
            return

        if await user_has_liked(post, user):
            await remove_like(post, user)
            liked = False
            print(f"💔 {user.username} unliked Post {post_id}")
        else:
            await add_like(post, user)
            liked = True
            print(f"❤️ {user.username} liked Post {post_id}")

        likes_count = await get_likes_count(post)
        print(f"🔢 Total Likes on Post {post_id}: {likes_count}")

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'post_update',
                'post_id': post_id,
                'likes_count': likes_count,
                'liked': liked
            }
        )

    async def handle_comment(self, data, user):
        post_id = data.get('post_id')
        text = data.get('text')

        print(f"💬 Comment action: '{text}' on Post ID {post_id} by User {user.username}")

        post = await get_post(post_id)
        if not post:
            print(f"❌ Post with ID {post_id} not found. Comment action aborted.")
            return

        comment = await create_comment(user, post, text)
        comment_data = await serialize_comment(comment)

        print(f"✅ Comment saved: {comment_data}")

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'new_comment',
                'post_id': post_id,
                'comment': comment_data
            }
        )

    # Broadcasting events
    async def post_update(self, event):
        print(f"📤 Broadcasting post update: {event}")
        await self.send(text_data=json.dumps({
            'type': 'post_update',
            'post_id': event['post_id'],
            'likes_count': event['likes_count'],
            'liked': event['liked']
        }))

    async def new_comment(self, event):
        print(f"📤 Broadcasting new comment: {event}")
        await self.send(text_data=json.dumps({
            'type': 'new_comment',
            'post_id': event['post_id'],
            'comment': event['comment']
        }))
