from rest_framework import serializers
from .models import Trail, TrailSegment, Waypoint, OfflineMap, TrailReview, TrailImage, WaypointImage

# TrailImage Serializer
class TrailImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrailImage
        fields = ['id', 'image', 'uploaded_at']

# WaypointImage Serializer
class WaypointImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = WaypointImage
        fields = ['id', 'image', 'uploaded_at']

# Trail Segment Serializer
class TrailSegmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrailSegment
        fields = ['id', 'routed', 'points']

# Waypoint Serializer
class WaypointSerializer(serializers.ModelSerializer):
    images = WaypointImageSerializer(many=True, read_only=True)  # Nested images

    class Meta:
        model = Waypoint
        fields = ['id', 'name', 'description', 'latitude', 'longitude', 'images']

# Offline Map Serializer
class OfflineMapSerializer(serializers.ModelSerializer):
    class Meta:
        model = OfflineMap
        fields = ['id', 'file', 'map_type']

# Trail Review Serializer
class TrailReviewSerializer(serializers.ModelSerializer):
    written_by_username = serializers.CharField(source='written_by.username', read_only=True)

    class Meta:
        model = TrailReview
        fields = ['id', 'trail', 'written_by', 'written_by_username', 'rating', 'comment', 'created_at']
        read_only_fields = ['written_by', 'created_at']

# Main Trail Serializer
class TrailSerializer(serializers.ModelSerializer):
    segments = TrailSegmentSerializer(many=True, read_only=True)
    waypoints = WaypointSerializer(many=True, read_only=True)
    offline_maps = OfflineMapSerializer(many=True, read_only=True)
    reviews = TrailReviewSerializer(many=True, read_only=True)
    images = TrailImageSerializer(many=True, read_only=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model = Trail
        fields = [
            'id',
            'name',
            'type',
            'location',
            'images',
            'checklist',
            'description',
            'difficulty',
            'distance_km',
            'highest_altitude',
            'created_at',
            'created_by',
            'created_by_username',
            'segments',
            'waypoints',
            'offline_maps',
            'reviews'
        ]
        read_only_fields = ['created_by', 'created_at']
