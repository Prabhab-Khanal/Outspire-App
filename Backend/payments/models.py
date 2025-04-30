from django.db import models
from django.conf import settings

class Payment(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    transaction_id = models.CharField(max_length=255, unique=True)
    pidx = models.CharField(max_length=255, unique=True, null= True)
    payment_status = models.CharField(max_length=50, choices=[('pending', 'Pending'), ('completed', 'Completed')], default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

