from django.db import models

# Model for storing trail general information
class Trail(models.Model):
    name = models.CharField(max_length=255)
    location = models.CharField(max_length=255)
    difficulty_choices = [
        ('easy', 'Easy'),
        ('moderate', 'Moderate'),
        ('hard', 'Hard'),
        ('expert', 'Expert')
    ]
    difficulty = models.CharField(max_length=10, choices=difficulty_choices)
    distance = models.DecimalField(max_digits=10, decimal_places=2)  # Distance in km or miles
    elevation = models.DecimalField(max_digits=10, decimal_places=2)  # Elevation in meters or feet
    estimated_time = models.DecimalField(max_digits=10, decimal_places=2)  # Estimated time in hours
    description = models.TextField()
    is_verified = models.BooleanField(default=False)

    def __str__(self):
        return self.name

# Model for storing images related to trails and points
class TrailImage(models.Model):
    image_url = models.URLField()
    related_id = models.IntegerField()  # Related trail_id or point_id
    
    def __str__(self):
        return f"Image for  {self.related_id}"

# Model for storing points along the trail
class TrailPoint(models.Model):
    trail = models.ForeignKey(Trail, on_delete=models.CASCADE, related_name='points')
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    nickname = models.CharField(max_length=255, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    image = models.ForeignKey(TrailImage, on_delete=models.CASCADE, null=True, blank=True)
    
    def __str__(self):
        return f"Point {self.nickname or 'No Nickname'} on {self.trail.name}"

# Model for storing images for specific points
class PointImage(models.Model):
    image_url = models.URLField()
    point = models.ForeignKey(TrailPoint, on_delete=models.CASCADE, related_name='images')
    
    def __str__(self):
        return f"Image for {self.point.nickname or 'No Nickname'}"

# Model for storing reviews related to trails
# class TrailReview(models.Model):
#     trail = models.ForeignKey(Trail, on_delete=models.CASCADE, related_name='reviews')
#     user = models.ForeignKey('auth.User', on_delete=models.CASCADE)  # Assuming User model from Django auth system
#     rating = models.IntegerField(choices=[(1, '1'), (2, '2'), (3, '3'), (4, '4'), (5, '5')])
#     review_text = models.TextField()
#     created_at = models.DateTimeField(auto_now_add=True)

#     def __str__(self):
#         return f"Review by {self.user.username} on {self.trail.name}"

# Model for storing checklist items related to trails
class Checklist(models.Model):
    trail = models.ForeignKey(Trail, on_delete=models.CASCADE, related_name='checklist')
    item_name = models.CharField(max_length=255)
    
    def __str__(self):
        return f"{self.item_name} for {self.trail.name}"
