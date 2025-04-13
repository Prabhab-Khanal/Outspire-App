from django.db import models
from django.conf import settings

# Model to store notifications
class Notification(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)  # User receiving the notification
    message = models.TextField()  # Content of the notification
    is_read = models.BooleanField(default=False)  # Mark notification as read/unread
    created_at = models.DateTimeField(auto_now_add=True)  # When the notification was created

    def __str__(self):
        return f"Notification for {self.user.username}: {self.message[:30]}"
