

from rest_framework import serializers
from .models import EmergencyContact, SOSAlert

class EmergencyContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmergencyContact
        fields = ['id', 'name', 'phone']


class SOSAlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = SOSAlert
        fields = ['id', 'latitude', 'longitude', 'place_name', 'timestamp']
        read_only_fields = ['id', 'timestamp']
