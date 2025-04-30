from rest_framework import serializers
from .models import Message, ChatGroup, GroupMessage

class MessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source='sender.username', read_only=True)
    receiver_username = serializers.CharField(source='receiver.username', read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'sender', 'sender_username', 'receiver', 'receiver_username', 'text', 'timestamp']
        read_only_fields = ['id', 'timestamp', 'sender', 'sender_username', 'receiver_username']

class ChatGroupSerializer(serializers.ModelSerializer):
    last_message_time = serializers.SerializerMethodField()

    class Meta:
        model = ChatGroup
        fields = ['id', 'name', 'last_message_time']  # 👈 Add last_message_time in fields

    def get_last_message_time(self, obj):
        latest_message = GroupMessage.objects.filter(group=obj).order_by('-timestamp').first()
        return latest_message.timestamp if latest_message else None

class GroupMessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source='sender.username', read_only=True)
    group_name = serializers.CharField(source='group.name', read_only=True)

    class Meta:
        model = GroupMessage
        fields = ['id', 'group', 'group_name', 'sender', 'sender_username', 'text', 'timestamp']
        read_only_fields = ['id', 'timestamp', 'sender', 'sender_username', 'group_name']
