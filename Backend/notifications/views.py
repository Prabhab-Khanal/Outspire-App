# utils.py
from .models import Notification

def create_notification(receiver, type, title, body, sender=None):
    Notification.objects.create(
        receiver=receiver,
        sender=sender,
        type=type,
        title=title,
        body=body
    )

def create_bulk_notifications(users, type, title, body, sender=None):
    notifications = [
        Notification(
            receiver=u,
            sender=sender,
            type=type,
            title=title,
            body=body
        ) for u in users
    ]
    Notification.objects.bulk_create(notifications)


# views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from .models import PushToken, Notification
from .serializers import PushTokenSerializer, NotificationSerializer

# Save or Update Push Token
class SavePushTokenView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        token = request.data.get('token')
        if not token:
            return Response({'error': 'No token provided'}, status=status.HTTP_400_BAD_REQUEST)

        push_token, created = PushToken.objects.update_or_create(
            user=request.user,
            defaults={'token': token}
        )
        return Response({'message': 'Push token saved successfully'}, status=status.HTTP_200_OK)


# List Notifications for a User
class ListNotificationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        notifications = Notification.objects.filter(receiver=request.user).order_by('-created_at')
        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
