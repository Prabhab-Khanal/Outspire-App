from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from unittest.mock import patch
from payments.models import Payment

User = get_user_model()

class KhaltiPaymentTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="Test@1234",
            phone_number="9800000000",
            first_name="Test",
            last_name="User",
        )
        self.client.force_authenticate(user=self.user)

    @patch('payments.views.requests.post')
    def test_initiate_khalti_payment(self, mock_post):
        mock_post.return_value.status_code = 200
        mock_post.return_value.json.return_value = {
            'pidx': 'fake_pidx_123',
            'payment_url': 'https://khalti.com/payment/test-url'
        }

        url = reverse('khalti-initiate')
        response = self.client.post(url, {'plan': 'monthly'}, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('payment_url', response.data)
        self.assertIn('pidx', response.data)
        print(" Khalti payment initiate test passed")

    @patch('payments.views.requests.post')
    def test_verify_khalti_payment(self, mock_post):
        # Create dummy payment with pidx
        payment = Payment.objects.create(
            user=self.user,
            amount=1499,
            transaction_id="tx12345",
            pidx="fake_pidx_verify",
            payment_status="pending"
        )

        mock_post.return_value.status_code = 200
        mock_post.return_value.json.return_value = {
            'status': 'Completed'
        }

        url = reverse('khalti-verify')
        response = self.client.post(url, {'pidx': payment.pidx}, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        payment.refresh_from_db()
        self.user.refresh_from_db()

        self.assertEqual(payment.payment_status, "completed")
        self.assertTrue(self.user.is_premium)
        print(" Khalti payment verification test passed")

    def test_subscription_status_regular(self):
        url = reverse('subscription-status')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['plan'], 'Regular')
        self.assertFalse(response.data['is_active'])
        print(" Subscription status for regular user test passed")

    def test_subscription_status_premium(self):
        # Create completed payment
        Payment.objects.create(
            user=self.user,
            amount=1499,
            transaction_id="tx12345",
            pidx="pidx12345",
            payment_status="completed"
        )

        url = reverse('subscription-status')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('plan', response.data)
        self.assertIn('is_active', response.data)
        print(" Subscription status for premium user test passed")
