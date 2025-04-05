from rest_framework import serializers
from .models import Trail, TrailPoint, TrailImage, Checklist

# Serializer for Trail
class TrailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trail
        fields = '__all__'

# Serializer for TrailPoint
class TrailPointSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrailPoint
        fields = '__all__'

# Serializer for TrailImage
class TrailImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrailImage
        fields = '__all__'

class ChecklistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Checklist
        fields = '__all__'