from django.urls import path
from .views import InitiateKhaltiPayment, SubscriptionStatusView, VerifyKhaltiPayment

urlpatterns = [
    path('khalti/initiate/', InitiateKhaltiPayment.as_view(), name='khalti-initiate'),
    path('khalti/verify/', VerifyKhaltiPayment.as_view(), name='khalti-verify'),
    path('subscription-status/', SubscriptionStatusView.as_view(), name='subscription-status'),
]
