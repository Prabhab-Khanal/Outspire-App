from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class EmergencyContact(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='emergency_contacts')
    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20)

    def __str__(self):
        return f"{self.name} ({self.phone}) - {self.user.username}"


class SOSAlert(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sos_alerts')
    latitude = models.FloatField()
    longitude = models.FloatField()
    place_name = models.CharField(max_length=255, blank=True, null=True)  # 👈 New field
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"SOS by {self.user.username} near {self.place_name or 'Unknown'} at {self.timestamp.strftime('%Y-%m-%d %H:%M:%S')}"

