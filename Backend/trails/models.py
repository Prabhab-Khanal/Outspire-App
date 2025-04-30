from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Trail(models.Model):
    created_by = models.ForeignKey(User, related_name='created_trails', on_delete=models.SET_NULL, null=True, blank=True)
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=50)  # Hiking, Cycling, Trekking
    location = models.CharField(max_length=255)
    images = models.ManyToManyField('TrailImage', related_name='trails')  # Use Many-to-Many relationship with TrailImage model
    checklist = models.JSONField(default=list)  # List of key-value pairs
    description = models.TextField()
    difficulty = models.CharField(max_length=50)  # Easy, Moderate, Hard, Expert
    distance_km = models.FloatField()
    highest_altitude = models.IntegerField()
    is_approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class TrailImage(models.Model):
    image = models.ImageField(upload_to='trail_images/')  # Save image files in 'trail_images' folder
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image {self.id}"

class TrailSegment(models.Model):
    trail = models.ForeignKey(Trail, related_name='segments', on_delete=models.CASCADE)
    routed = models.BooleanField(default=True)  # True = snapped to route, False = straight line
    points = models.JSONField(default=list)  # List of lat/lng dictionaries [{"latitude": xx, "longitude": yy}]

    def __str__(self):
        return f"Segment for {self.trail.name}"

class Waypoint(models.Model):
    trail = models.ForeignKey(Trail, related_name='waypoints', on_delete=models.CASCADE)
    name = models.CharField(max_length=255, blank=True)
    description = models.TextField(blank=True)
    latitude = models.FloatField()
    longitude = models.FloatField()
    images = models.ManyToManyField('WaypointImage', related_name='waypoints')  # Many-to-Many relationship for images

    def __str__(self):
        return f"Waypoint {self.name or 'Unnamed'} for {self.trail.name}"

class WaypointImage(models.Model):
    image = models.ImageField(upload_to='waypoint_images/')  # Save image files in 'waypoint_images' folder
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Waypoint Image {self.id}"

class OfflineMap(models.Model):
    trail = models.ForeignKey(Trail, related_name='offline_maps', on_delete=models.CASCADE)
    file = models.FileField(upload_to='offline_maps/')  # Stored file (e.g., zipped tiles or geojson)
    map_type = models.CharField(max_length=50, default='GeoJSON')  # Map format type (Tiles, GeoJSON, MBTiles)

    def __str__(self):
        return f"Offline Map for {self.trail.name}"

class TrailReview(models.Model):
    trail = models.ForeignKey(Trail, related_name='reviews', on_delete=models.CASCADE)
    written_by = models.ForeignKey(User, related_name='written_reviews', on_delete=models.SET_NULL, null=True, blank=True)
    rating = models.IntegerField()  # 1 to 5 stars
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Review {self.rating}★ for {self.trail.name}"
