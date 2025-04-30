from rest_framework import serializers
from .models import  SOSAlert




class SOSAlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = SOSAlert
        fields = ['id', 'latitude', 'longitude', 'place_name', 'timestamp']
        read_only_fields = ['id', 'timestamp']

