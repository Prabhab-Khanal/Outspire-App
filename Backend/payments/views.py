import uuid
import requests
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from notifications.utils import create_notification
from .models import Payment
from datetime import timedelta
from django.utils import timezone


# TEST SERVER (sandbox)
KHALTI_INIT_URL = "https://dev.khalti.com/api/v2/epayment/initiate/"
KHALTI_VERIFY_URL = "https://dev.khalti.com/api/v2/epayment/lookup/"


# Khalti Test URLs
KHALTI_INIT_URL = "https://dev.khalti.com/api/v2/epayment/initiate/"

class InitiateKhaltiPayment(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        print("Initiate Payment API Called")
        user = request.user

        # 1. Check if already premium
        if user.is_premium:
            print("User is already premium.")
            return Response({"already_premium": True}, status=200)

        # 2. Get amount
        plan = request.data.get('plan', 'monthly')
        amount = 1499.00 if plan == 'monthly' else 14999.00
        amount_paisa = int(amount * 100)

        transaction_id = str(uuid.uuid4())
        print(f"User: {user.username}, Plan: {plan}, Amount: {amount_paisa} paisa, Transaction ID: {transaction_id}")

        # 3. Save payment in DB (without pidx yet)
        payment = Payment.objects.create(
            user=user,
            amount=amount,
            transaction_id=transaction_id
        )
        print("Payment record created in database.")

        # 4. Prepare Khalti Payload
        payload = {
            "return_url": "https://yourapp.com/payment/success",
            "website_url": "https://yourapp.com",
            "amount": amount_paisa,
            "purchase_order_id": transaction_id,
            "purchase_order_name": "Outspire Premium",
            "customer_info": {
                "name": user.username or "User",
                "email": user.email or "email@example.com",
                "phone": getattr(user, 'phone_number') or '980000000'
            }
        }

        headers = {
            "Authorization": f"Key {settings.KHALTI_SECRET_KEY}"
        }

        # 5. Send to Khalti
        try:
            print("Sending request to Khalti...")
            response = requests.post(KHALTI_INIT_URL, json=payload, headers=headers)
            print("Khalti response status code:", response.status_code)
            print("Khalti raw response:", response.text)

            response.raise_for_status()
            data = response.json()

            # 6. Update Payment with pidx
            payment.pidx = data.get('pidx')
            payment.save()

            print("Khalti Payment Initiated Successfully:", data)

            return Response({
                "payment_url": data.get("payment_url"),
                "pidx": data.get("pidx")
            }, status=status.HTTP_200_OK)

        except requests.exceptions.RequestException as e:
            print("Error during Khalti initiate payment:", str(e))
            return Response({"error": "Failed to initiate payment"}, status=400)


class VerifyKhaltiPayment(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        print("Verify Payment API Called")
        pidx = request.data.get('pidx')
        print(f"Received pidx: {pidx}")

        if not pidx:
            return Response({"error": "Missing pidx"}, status=status.HTTP_400_BAD_REQUEST)

        headers = {
            "Authorization": f"Key {settings.KHALTI_SECRET_KEY}"
        }

        try:
            print("Sending verification request to Khalti...")
            response = requests.post(KHALTI_VERIFY_URL, json={"pidx": pidx}, headers=headers)
            print("Khalti verification response status code:", response.status_code)
            print("Khalti verification raw response:", response.text)

            response.raise_for_status()
            data = response.json()

            if data["status"] == "Completed":
                # Find payment using pidx
                payment = Payment.objects.filter(pidx=pidx).first()
                if payment:
                    payment.payment_status = "completed"
                    payment.save()

                    # Mark user as premium
                    user = payment.user
                    user.is_premium = True  # Assuming your User model has 'is_premium' BooleanField
                    user.save()

                    create_notification(
                        receiver=user,
                        type='premium',
                        title='Premium Activated',
                        body='Congratulations! Your premium membership is now active.'
                    )

                    print(f"Payment verified. User {user.username} upgraded to premium.")

                    return Response({"status": "success", "message": "Payment verified and user upgraded to premium."})
                else:
                    return Response({"error": "Payment record not found."}, status=404)
            else:
                return Response({"error": "Payment not completed yet."}, status=400)

        except requests.exceptions.RequestException as e:
            print("Error during Khalti verification:", str(e))
            return Response({"error": "Khalti verification failed", "details": str(e)}, status=400)


class SubscriptionStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        print(f"🔵 Checking subscription status for user: {user.user_id} - {user.username}")

        try:
            # Get the latest successful payment
            payment = Payment.objects.filter(user=user, payment_status='completed').latest('created_at')
            print(f"✅ Found payment: Transaction ID = {payment.transaction_id}, Amount = {payment.amount}")

            if payment.amount == 1499:
                validity_days = 30
                plan = 'Monthly'
            elif payment.amount == 14999:
                validity_days = 365
                plan = 'Yearly'
            else:
                validity_days = 0
                plan = 'Unknown'
                print(f"⚠️ Unknown plan for payment amount: {payment.amount}")

            start_date = payment.created_at.date()
            end_date = start_date + timedelta(days=validity_days)

            is_active = timezone.now().date() <= end_date
            print(f"📅 Subscription start: {start_date}, end: {end_date}, active: {is_active}")

            data = {
                'plan': plan,
                'start_date': start_date,
                'end_date': end_date,
                'is_active': is_active
            }
            return Response(data, status=status.HTTP_200_OK)

        except Payment.DoesNotExist:
            print(f"⚠️ No completed payment found for user {user.user_id} - {user.username}")
            return Response({
                'plan': 'Regular',
                'is_active': False
            }, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"❌ Error while checking subscription: {str(e)}")
            return Response({
                'error': 'Failed to fetch subscription status.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)