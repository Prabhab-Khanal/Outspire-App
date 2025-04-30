from rest_framework import serializers
from .models import PushToken, Notification

class PushTokenSerializer(serializers.ModelSerializer):
    class Meta:
        model = PushToken
        fields = ['token']


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'title', 'body', 'type', 'is_read', 'created_at']
