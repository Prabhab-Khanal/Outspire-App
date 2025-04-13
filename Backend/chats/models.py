from django.db import models
from django.conf import settings

# Model for storing group chat details
class ChatRoom(models.Model):
    name = models.CharField(max_length=255)  # Chat room name (can be dynamic for group names)
    participants = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='chat_rooms')  # Users in the group chat

    def __str__(self):
        return self.name


# Model for storing messages in the chat room
class ChatMessage(models.Model):
    room = models.ForeignKey(ChatRoom, related_name='messages', on_delete=models.CASCADE)  # Chat room the message belongs to
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)  # User sending the message
    content = models.TextField()  # Message content
    created_at = models.DateTimeField(auto_now_add=True)  # Timestamp of when the message was sent

    def __str__(self):
        return f"{self.user.username}: {self.content[:30]}"  # Preview of message content (first 30 chars)
