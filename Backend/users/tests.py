from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from unittest.mock import patch
from django.core.cache import cache

User = get_user_model()

class UserTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.test_email = "testuser@example.com"
        self.test_username = "testuser"
        self.test_password = "Test@1234"
        self.user = User.objects.create_user(
            username=self.test_username,
            email=self.test_email,
            password=self.test_password,
            phone_number="9800000000",
            first_name="Test",
            last_name="User",
            is_email_verified=True
        )

    def test_register_user(self):
        url = reverse('register_user')
        data = {
            "username": "newuser",
            "email": "newuser@example.com",
            "password": "Test@1234",
            "confirm_password": "Test@1234",
            "first_name": "New",
            "last_name": "User",
            "phone_number": "9810000000"
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        print("Passed: Register user test passed")

    def test_login_user(self):
        url = reverse('login_user')
        response = self.client.post(url, {"username_or_email": self.test_email, "password": self.test_password})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access_token", response.data)
        print("Passed: Login user test passed")

    def test_verify_otp_invalid(self):
        url = reverse('verify_otp')
        response = self.client.post(url, {"email": self.test_email, "otp": "123456", "otp_type": "register"})
        self.assertEqual(response.status_code, 400)
        print("Passed: Verify invalid OTP test passed")

    def test_forgot_password(self):
        url = reverse('forgot_password')
        response = self.client.post(url, {"email": self.test_email})
        self.assertEqual(response.status_code, 200)
        print("Passed: Forgot password request test passed")

    def test_reset_password_invalid_otp(self):
        url = reverse('reset_password')
        data = {
            "email": self.test_email,
            "otp": "000000",
            "new_password": "Newpass123"
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, 400)
        print("Passed: Reset password with invalid OTP test passed")

    def test_profile_get(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('get_profile')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        print("Passed: Get profile test passed")

    def test_update_profile(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('update_profile')
        response = self.client.put(url, {"first_name": "Updated"})
        self.assertEqual(response.status_code, 200)
        print("Passed: Update profile test passed")

    def test_create_preference(self):
        url = reverse('create_preference')
        response = self.client.post(url, {"preference_name": "Hiking"})
        self.assertEqual(response.status_code, 201)
        print("Passed: Create preference test passed")

    def test_emergency_contact_create(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('create_emergency_contact')
        data = {
            "contact_name": "Emergency Person",
            "relationship": "Friend",
            "phone_number": "9820000000",
            "email": "emergency@example.com",
            "address": "Kathmandu"
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, 201)
        print("Passed: Create emergency contact test passed")
        print('\n')
    def test_follow_toggle(self):
        user2 = User.objects.create_user(
            username="anotheruser",
            email="anotheruser@example.com",
            password="Test@1234",
            phone_number="9811111111",
            is_email_verified=True
        )
        self.client.force_authenticate(user=self.user)
        url = reverse('follow_toggle')
        response = self.client.post(url, {"username": "anotheruser"})
        self.assertIn(response.status_code, [200])
        print("Passed: Follow toggle test passed")

    def test_follow_status(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('follow_status')
        response = self.client.get(url, {"username": self.user.username})
        self.assertEqual(response.status_code, 200)
        print("Passed: Follow status test passed")

    def test_check_username_email(self):
        url = reverse('check-username-email')
        response = self.client.post(url, {"username": "testuser", "email": "testuser@example.com"})
        self.assertEqual(response.status_code, 400)
        print("Passed: Check username/email already exists test passed")

    def test_check_phone_number(self):
        url = reverse('check-phone-number')
        response = self.client.post(url, {"phone_number": "9800000000"})
        self.assertEqual(response.status_code, 400)
        print("Passed: Check phone number already exists test passed")



