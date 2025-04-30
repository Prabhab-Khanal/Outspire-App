from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model

from users.serializers import UserProfileSerializer
from .models import Message, ChatGroup, GroupMessage
from .serializers import MessageSerializer, ChatGroupSerializer, GroupMessageSerializer
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q  # <-- Add this at the top

User = get_user_model()
from users.models import Follow  # Adjust if your follow system is elsewhere

class ListUserGroupsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        groups = ChatGroup.objects.filter(members=request.user)
        serializer = ChatGroupSerializer(groups, many=True)
        return Response(serializer.data)

# ----- Private Messaging -----
class SendMessageView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        receiver_username = request.data.get('receiver')
        text = request.data.get('text')

        if not receiver_username or not text:
            return Response({"error": "Receiver and text are required."}, status=400)

        try:
            receiver = User.objects.get(username=receiver_username)
        except User.DoesNotExist:
            return Response({"error": "Receiver does not exist."}, status=404)

        if not Follow.objects.filter(follower=request.user, following=receiver).exists():
            return Response({"error": "You can only message users you are following."}, status=403)

        message = Message.objects.create(sender=request.user, receiver=receiver, text=text)
        serializer = MessageSerializer(message)
        return Response(serializer.data, status=201)

class FetchMessagesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        username = request.query_params.get('user')

        if not username:
            return Response({"error": "Username is required."}, status=400)

        try:
            other_user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response({"error": "User does not exist."}, status=404)

        messages = Message.objects.filter(
            (Q(sender=request.user, receiver=other_user) |
             Q(sender=other_user, receiver=request.user))
        ).order_by('timestamp')

        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)

# ----- Group Messaging -----
class CreateGroupView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        name = request.data.get('name')
        member_ids = request.data.get('members', [])  # <-- Fetch member IDs

        if not name:
            return Response({"error": "Group name is required."}, status=400)

        group = ChatGroup.objects.create(name=name)
        group.members.add(request.user)  # Add the creator first

        if member_ids:
            users = User.objects.filter(id__in=member_ids)
            group.members.add(*users)  # <-- Add selected members

class CreateGroupView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        name = request.data.get('name')
        member_ids = request.data.get('members', [])  # <-- Fetch member IDs

        if not name:
            return Response({"error": "Group name is required."}, status=400)

        group = ChatGroup.objects.create(name=name)
        group.members.add(request.user)  # Add the creator first

        if member_ids:
            users = User.objects.filter(user_id__in=member_ids)
            group.members.add(*users)  # <-- Add selected members

        serializer = ChatGroupSerializer(group)
        return Response(serializer.data, status=201)

        


class JoinGroupView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        group_id = request.data.get('group_id')
        try:
            group = ChatGroup.objects.get(id=group_id)
        except ChatGroup.DoesNotExist:
            return Response({"error": "Group does not exist."}, status=404)

        group.members.add(request.user)
        return Response({"message": "Joined the group!"}, status=200)

class SendGroupMessageView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        group_id = request.data.get('group_id')
        text = request.data.get('text')

        if not group_id or not text:
            return Response({"error": "Group ID and text are required."}, status=400)

        try:
            group = ChatGroup.objects.get(id=group_id)
        except ChatGroup.DoesNotExist:
            return Response({"error": "Group does not exist."}, status=404)

        if request.user not in group.members.all():
            return Response({"error": "You must be a member of the group."}, status=403)

        group_message = GroupMessage.objects.create(group=group, sender=request.user, text=text)
        serializer = GroupMessageSerializer(group_message)
        return Response(serializer.data, status=201)

class FetchGroupMessagesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, group_id):
        try:
            group = ChatGroup.objects.get(id=group_id)
        except ChatGroup.DoesNotExist:
            return Response({"error": "Group does not exist."}, status=404)

        if request.user not in group.members.all():
            return Response({"error": "You are not a member of this group."}, status=403)

        messages = GroupMessage.objects.filter(group=group).order_by('timestamp')
        serializer = GroupMessageSerializer(messages, many=True)
        return Response(serializer.data)
    

class AddMembersToGroupView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        group_id = request.data.get('group_id')
        members = request.data.get('members', [])

        try:
            group = ChatGroup.objects.get(id=group_id)
        except ChatGroup.DoesNotExist:
            return Response({'error': 'Group not found'}, status=404)

        for member_id in members:
            try:
                user = User.objects.get(user_id=member_id)
                group.members.add(user)
            except User.DoesNotExist:
                continue

        return Response({'message': 'Members added successfully'})

class RenameGroupView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        group_id = request.data.get('group_id')
        new_name = request.data.get('new_name')

        try:
            group = ChatGroup.objects.get(id=group_id)
        except ChatGroup.DoesNotExist:
            return Response({'error': 'Group not found'}, status=404)

        group.name = new_name
        group.save()

        return Response({'message': 'Group renamed successfully'})


class ListGroupMembersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, group_id):
        try:
            group = ChatGroup.objects.get(id=group_id)
        except ChatGroup.DoesNotExist:
            return Response({"error": "Group does not exist."}, status=404)

        # Check if the user is a member first
        if request.user not in group.members.all():
            return Response({"error": "You are not a member of this group."}, status=403)

        members = group.members.all()
        serializer = UserProfileSerializer(members, many=True)  # Assuming you have a serializer
        return Response(serializer.data)
    


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from .models import Message

User = get_user_model()

class ChatUsersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        # Fetch user IDs and their latest message timestamp
        sent_messages = Message.objects.filter(sender=user)
        received_messages = Message.objects.filter(receiver=user)

        chat_users = {}

        for message in sent_messages:
            receiver_id = message.receiver.user_id
            if receiver_id not in chat_users or message.timestamp > chat_users[receiver_id]:
                chat_users[receiver_id] = message.timestamp

        for message in received_messages:
            sender_id = message.sender.user_id
            if sender_id not in chat_users or message.timestamp > chat_users[sender_id]:
                chat_users[sender_id] = message.timestamp

        chat_users.pop(user.user_id, None)  # Exclude yourself

        users = User.objects.filter(user_id__in=chat_users.keys())

        user_data = []
        for u in users:
            user_data.append({
                'user_id': u.user_id,
                'username': u.username,
                'profile_picture': u.profile_picture.url if u.profile_picture else None,
                'last_message_time': chat_users[u.user_id]  # include latest message time
            })

        return Response(user_data)


class LeaveGroupView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, group_id):
        try:
            group = ChatGroup.objects.get(id=group_id)
            group.members.remove(request.user)
            return Response({"message": "Left group successfully."})
        except ChatGroup.DoesNotExist:
            return Response({"error": "Group not found."}, status=status.HTTP_404_NOT_FOUND)