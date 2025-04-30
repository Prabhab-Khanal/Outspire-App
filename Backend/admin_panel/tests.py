from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from users.models import User
from trails.models import Trail
from community.models import Post
from payments.models import Payment
from notifications.models import Notification

class AdminPanelTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_user(
            username="adminuser",
            email="admin@example.com",
            password="adminpass",
            phone_number="9800000000",
            role="Admin",
            is_staff=True,
            is_email_verified=True
        )
        self.regular = User.objects.create_user(
            username="testuser",
            email="user@example.com",
            password="userpass",
            phone_number="9800000001",
            is_email_verified=True
        )
        self.trail = Trail.objects.create(
            name="Test Trail",
            type="Hiking",
            location="Test Location",
            description="Nice trail",
            difficulty="Easy",
            distance_km=5.0,
            highest_altitude=1500,
            created_by=self.admin,
            is_approved=False
        )
        self.post = Post.objects.create(user=self.regular, caption="Test Post", location="Test Loc")
        self.client.force_authenticate(user=self.admin)

    def test_admin_login(self):
        self.client.logout()
        url = reverse("admin-login")
        response = self.client.post(url, {"email": self.admin.email, "password": "adminpass"})
        self.assertEqual(response.status_code, 200)
        print("Passed: Admin login test passed")

    def test_user_list(self):
        url = reverse("admin-user-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        print("Passed: Admin user list test passed")

    def test_update_email_verified(self):
        url = reverse("admin-update-email-verified", kwargs={"user_id": self.regular.user_id})
        response = self.client.post(url, {"action": "verify"})
        self.assertEqual(response.status_code, 200)
        print("Passed: Update email verification status test passed")

    def test_dashboard_stats(self):
        url = reverse("admin-dashboard-stats")
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        print("Passed: Admin dashboard stats test passed")

    def test_send_notification(self):
        url = reverse("admin-send-notification")
        response = self.client.post(url, {
            "target": "all",
            "title": "Announcement",
            "body": "This is a test notification."
        })
        self.assertEqual(response.status_code, 200)
        print("Passed: Send admin notification test passed")

    def test_payment_list(self):
        Payment.objects.create(user=self.regular, amount=1499, transaction_id="tx1", payment_status="completed")
        url = reverse("admin-payment-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        print("Passed: Admin payment list test passed")

    def test_list_trails(self):
        url = reverse("admin-list-trails")
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        print("Passed: Admin trail listing test passed")

    def test_trail_detail(self):
        url = reverse("admin-trail-detail", kwargs={"trail_id": self.trail.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        print("Passed: Admin trail detail view test passed")

    def test_toggle_trail_approval(self):
        url = reverse("admin-toggle-trail", kwargs={"trail_id": self.trail.id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, 200)
        print("Passed: Toggle trail approval test passed")

    def test_delete_trail(self):
        url = reverse("admin-delete-trail", kwargs={"trail_id": self.trail.id})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, 200)
        print("Passed: Delete trail test passed")

    def test_hide_post(self):
        url = reverse("admin-hide-post", kwargs={"post_id": self.post.id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, 200)
        print("Passed: Toggle post hide test passed")

    def test_delete_post(self):
        url = reverse("admin-delete-post", kwargs={"post_id": self.post.id})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, 200)
        print("Passed: Delete post test passed")

    def test_post_detail(self):
        url = f"/admin_panel/posts/{self.post.id}/detail/"
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        print("Passed: Admin post detail test passed")

    def test_ban_user(self):
        url = reverse("admin-ban-user", kwargs={"user_id": self.regular.user_id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, 200)
        print("Passed: Ban user test passed")

    def test_toggle_ban_user(self):
        url = reverse("admin-toggle-ban-user", kwargs={"user_id": self.regular.user_id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, 200)
        print("Passed: Toggle user ban test passed")
