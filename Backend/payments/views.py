import requests
from django.shortcuts import render
from django.http import JsonResponse
from .models import Payment
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt

# Khalti API URLs
KHALTI_PAYMENT_URL = "https://khalti.com/api/v2/payment/"
KHALTI_SECRET_KEY = settings.KHALTI_SECRET_KEY  # Secret key for payment verification
KHALTI_PUBLIC_KEY = settings.KHALTI_PUBLIC_KEY  # Public key to initiate payments

def initiate_payment(request):
    """
    Initiates the payment by creating a payment entry in the database
    and sending a payment request to Khalti.
    """
    # Amount to be paid (for testing purposes, this can be dynamic)
    amount = 100.00  # Example: 100 Nepalese Rupees

    # Create a payment record in the database
    payment = Payment.objects.create(
        user=request.user,
        amount=amount,
    )

    # Prepare data to initiate the payment via Khalti API
    payment_data = {
        'public_key': KHALTI_PUBLIC_KEY,
        'amount': int(payment.amount * 100),  # Khalti expects amount in paisa (1 NRs = 100 paisa)
        'order_id': payment.transaction_id,
    }

    # Send the payment initiation request to Khalti
    response = requests.post(KHALTI_PAYMENT_URL, data=payment_data)

    if response.status_code == 200:
        return JsonResponse({
            'payment_url': response.json()['url']  # Khalti's payment URL for the user to pay
        })
    else:
        return JsonResponse({
            'error': 'Payment initiation failed. Please try again.'
        })

@csrf_exempt  # To handle the POST request sent from Khalti after payment
def verify_payment(request):
    """
    Verifies the payment after the user has made the payment.
    Khalti will send a verification request to this endpoint.
    """
    if request.method == 'POST':
        transaction_id = request.POST.get('transaction_id')  # Get the transaction ID from the POST request
        payment = Payment.objects.filter(transaction_id=transaction_id).first()

        if payment:
            # Prepare data for verifying the payment
            verification_data = {
                'transaction_id': transaction_id,
                'secret_key': KHALTI_SECRET_KEY
            }

            # Verify the payment with Khalti's API
            verify_response = requests.post(KHALTI_PAYMENT_URL + 'verify/', data=verification_data)

            if verify_response.status_code == 200:
                payment.payment_status = 'completed'
                payment.save()

                return JsonResponse({'status': 'success', 'message': 'Payment verified successfully.'})
            else:
                return JsonResponse({'status': 'error', 'message': 'Payment verification failed.'})

        return JsonResponse({'status': 'error', 'message': 'Transaction not found.'})

    return JsonResponse({'status': 'error', 'message': 'Invalid request.'})
