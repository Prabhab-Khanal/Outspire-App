import requests
from django.conf import settings
from .models import PushToken, Notification

EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send"

def send_push_notification(user, title, body, notification_type='custom', data=None):
    try:
        # 1. Get user's push token
        push_token_obj = PushToken.objects.filter(user=user).first()
        if not push_token_obj:
            return False, "No push token found for user."

        # 2. Build payload
        payload = {
            "to": push_token_obj.token,
            "title": title,
            "body": body,
            "data": data or {},  # optional extra data
            "sound": "default",  # play default notification sound
        }

        # 3. Send to Expo Push API
        headers = {
            "Accept": "application/json",
            "Accept-Encoding": "gzip, deflate",
            "Content-Type": "application/json",
        }

        response = requests.post(EXPO_PUSH_URL, json=payload, headers=headers)
        response_data = response.json()

        # 4. If token is invalid, remove it
        if "errors" in response_data.get('data', {}):
            push_token_obj.delete()
            return False, "Push token invalid, deleted."

        # 5. Save notification record (optional, for Notification Center)
        Notification.objects.create(
            receiver=user,
            title=title,
            body=body,
            type=notification_type,
        )

        return True, "Notification sent successfully."

    except Exception as e:
        return False, str(e)
    

from .models import Notification

def create_notification(receiver, type, title, body, sender=None):
    """
    Create a single notification.
    """
    Notification.objects.create(
        receiver=receiver,
        sender=sender,
        type=type,
        title=title,
        body=body
    )

def create_bulk_notifications(users, type, title, body, sender=None):
    """
    Create the same notification for multiple users (e.g., group message from admin).
    """
    notifications = [
        Notification(
            receiver=user,
            sender=sender,
            type=type,
            title=title,
            body=body
        ) for user in users
    ]
    Notification.objects.bulk_create(notifications)

def create_trail_status_notification(user, status, trail_name, sender=None):
    """
    Create a trail approval or rejection notification.
    """
    if status == 'approved':
        create_notification(
            receiver=user,
            sender=sender,
            type='trail_approved',
            title='Trail Approved',
            body=f'Your trail "{trail_name}" has been approved!'
        )
    elif status == 'rejected':
        create_notification(
            receiver=user,
            sender=sender,
            type='trail_rejected',
            title='Trail Rejected',
            body=f'Sorry, your trail "{trail_name}" was rejected.'
        )
    elif status == 'pending':
        create_notification(
            receiver=user,
            sender=sender,
            type='trail_pending',
            title='Trail Submitted',
            body=f'Your trail "{trail_name}" is pending admin approval.'
        )

