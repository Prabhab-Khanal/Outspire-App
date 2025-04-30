from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Message(models.Model):
    sender = models.ForeignKey(User, related_name='sent_messages', on_delete=models.CASCADE)
    receiver = models.ForeignKey(User, related_name='received_messages', on_delete=models.CASCADE)
    text = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"From {self.sender.username} to {self.receiver.username} at {self.timestamp}"

class ChatGroup(models.Model):
    name = models.CharField(max_length=255)
    members = models.ManyToManyField(User, related_name='chat_groups')

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class GroupMessage(models.Model):
    group = models.ForeignKey(ChatGroup, related_name='messages', on_delete=models.CASCADE)
    sender = models.ForeignKey(User, related_name='group_messages', on_delete=models.CASCADE)
    text = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Group {self.group.name}: {self.sender.username}: {self.text[:20]}"
