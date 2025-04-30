from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from chats.models import Message, ChatGroup, GroupMessage
from users.models import Follow

User = get_user_model()

class ChatTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user1 = User.objects.create_user(
            username="user1", email="user1@example.com", password="pass123",
            phone_number="9800000001", is_email_verified=True
        )
        self.user2 = User.objects.create_user(
            username="user2", email="user2@example.com", password="pass123",
            phone_number="9800000002", is_email_verified=True
        )
        self.client.force_authenticate(user=self.user1)
        Follow.objects.create(follower=self.user1, following=self.user2)

    def test_send_private_message(self):
        url = reverse('send-message')
        response = self.client.post(url, {"receiver": "user2", "text": "Hello!"})
        self.assertEqual(response.status_code, 201)
        print("Passed: Send private message test passed")

    def test_fetch_private_messages(self):
        Message.objects.create(sender=self.user1, receiver=self.user2, text="Hi!")
        url = reverse('fetch-messages')
        response = self.client.get(url, {"user": "user2"})
        self.assertEqual(response.status_code, 200)
        print("Passed: Fetch private messages test passed")

    def test_create_group(self):
        url = reverse('create-group')
        response = self.client.post(url, {
            "name": "Test Group",
            "members": [self.user2.user_id]
        }, format='json')
        self.assertEqual(response.status_code, 201)
        print("Passed: Create group test passed")

    def test_join_group(self):
        group = ChatGroup.objects.create(name="Joinable Group")
        url = reverse('join-group')
        response = self.client.post(url, {"group_id": group.id})
        self.assertEqual(response.status_code, 200)
        print("Passed: Join group test passed")

    def test_send_group_message(self):
        group = ChatGroup.objects.create(name="Group Msg")
        group.members.add(self.user1)
        url = reverse('send-group-message')
        response = self.client.post(url, {"group_id": group.id, "text": "Hello group!"})
        self.assertEqual(response.status_code, 201)
        print("Passed: Send group message test passed")

    def test_fetch_group_messages(self):
        group = ChatGroup.objects.create(name="Fetch Group")
        group.members.add(self.user1)
        GroupMessage.objects.create(group=group, sender=self.user1, text="Welcome!")
        url = reverse('fetch-group-messages', kwargs={"group_id": group.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        print("Passed: Fetch group messages test passed")

    def test_add_members_to_group(self):
        group = ChatGroup.objects.create(name="Add Members Group")
        group.members.add(self.user1)
        url = reverse('group-add-members')
        response = self.client.post(url, {
            "group_id": group.id,
            "members": [self.user2.user_id]
        })
        self.assertEqual(response.status_code, 200)
        print("Passed: Add members to group test passed")

    def test_rename_group(self):
        group = ChatGroup.objects.create(name="Old Name")
        group.members.add(self.user1)
        url = reverse('group-rename')
        response = self.client.post(url, {"group_id": group.id, "new_name": "New Name"})
        self.assertEqual(response.status_code, 200)
        group.refresh_from_db()
        self.assertEqual(group.name, "New Name")
        print("Passed: Rename group test passed")

    def test_list_group_members(self):
        group = ChatGroup.objects.create(name="Member List")
        group.members.add(self.user1)
        url = reverse('group-members', kwargs={"group_id": group.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        print("Passed: List group members test passed")

    def test_chat_users_list(self):
        Message.objects.create(sender=self.user1, receiver=self.user2, text="Hi again!")
        url = reverse('chat-users')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        print("Passed: Chat users listing test passed")

    def test_leave_group(self):
        group = ChatGroup.objects.create(name="Leavable Group")
        group.members.add(self.user1)
        url = reverse('leave-group', kwargs={"group_id": group.id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, 200)
        print("Passed: Leave group test passed")
