from django.db import models
from django.conf import settings

class PushToken(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='push_token')
    token = models.CharField(max_length=255)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - {self.token}"


class Notification(models.Model):
    NOTIFICATION_TYPES = (
        ('like', 'Like'),
        ('comment', 'Comment'),
        ('follow', 'Follow'),
        ('trail_pending', 'Trail Pending Approval'),
        ('trail_approved', 'Trail Approved'),
        ('trail_rejected', 'Trail Rejected'),
        ('message', 'New Message'),
        ('group_add', 'Added to Group'),
        ('premium', 'Premium Purchase'),
        ('sos', 'SOS Alert'),
        ('custom', 'Custom Message'),
    )

    receiver = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='sent_notifications')
    title = models.CharField(max_length=255)
    body = models.TextField()
    type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES, default='custom')
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"To {self.receiver.username}: {self.title}"