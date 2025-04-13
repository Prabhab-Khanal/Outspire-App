from django.db import models
from django.conf import settings

class Payment(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)  # The user making the payment
    amount = models.DecimalField(max_digits=10, decimal_places=2)  # The amount of the transaction
    transaction_id = models.CharField(max_length=255, unique=True)  # Khalti's unique transaction ID
    payment_status = models.CharField(max_length=50, choices=[('pending', 'Pending'), ('completed', 'Completed')], default='pending')
    created_at = models.DateTimeField(auto_now_add=True)  # Time when the payment was created

    def __str__(self):
        return f"Payment {self.transaction_id} by {self.user.username}"
