from django.conf import settings
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils.timezone import now

# User Role Choices
USER_ROLES = [
    ('Regular', 'Regular User'),
    ('Premium', 'Premium User'),
    ('Admin', 'Admin'),
]

class UserManager(BaseUserManager):
    """ Custom User Manager for Creating Users & Admins """

    def create_user(self, username, email, password=None, phone_number=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")
        if not username:
            raise ValueError("Username is required")
        

        email = self.normalize_email(email)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('is_email_verified', False)
        extra_fields.setdefault('role', 'Regular')

        user = self.model(username=username, email=email, phone_number=phone_number, **extra_fields)
        if password:
            user.set_password(password)  
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'Admin')
        return self.create_user(username, email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """ Custom User Model """

    user_id = models.BigAutoField(primary_key=True)
    username = models.CharField(max_length=50, unique=True)
    first_name = models.CharField(max_length=50)
    middle_name = models.CharField(max_length=50, blank=True, null=True)
    last_name = models.CharField(max_length=50)
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=15, unique=True)

    # Profile Fields
    profile_picture = models.ImageField(upload_to='profile_pictures/', blank=True, null=True, default='profile_pictures/' )
    bio = models.TextField(blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    gender = models.CharField(max_length=20, choices=[('Male', 'Male'), ('Female', 'Female'), ('Other', 'Other')], blank=True)
    location = models.CharField(max_length=100, blank=True, null=True)

    # User Role & Verification Status
    role = models.CharField(max_length=20, choices=USER_ROLES, default='Regular')
    is_premium = models.BooleanField(default=False)
    is_email_verified = models.BooleanField(default=False)
    is_emergencycontact_complete = models.BooleanField(default=False)
    is_profile_complete = models.BooleanField(default=False)
    is_preference_complete = models.BooleanField(default=False)

    # Authentication Fields
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)

    # Optional Google login
    google_id = models.CharField(max_length=255, blank=True, null=True, unique=True)

    date_joined = models.DateTimeField(default=now)
    last_login = models.DateTimeField(blank=True, null=True)

    objects = UserManager()

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']

    def __str__(self):
        return self.username


class UserPreference(models.Model):
    """User trail preferences: used for filtering and personalization."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='preference')

    preferred_trail_type = models.CharField(
        max_length=100,
        choices=[('Mountain', 'Mountain'), ('Road', 'Road'), ('Coastal', 'Coastal'), ('Forest', 'Forest')],
        blank=True, null=True
    )
    preferred_difficulty = models.CharField(
        max_length=50,
        choices=[('Easy', 'Easy'), ('Medium', 'Medium'), ('Hard', 'Hard')],
        blank=True, null=True
    )
    preferred_terrain = models.CharField(
        max_length=100,
        choices=[('Gravel', 'Gravel'), ('Asphalt', 'Asphalt'), ('Snow', 'Snow'), ('Forest', 'Forest')],
        blank=True, null=True
    )
    preferred_length = models.CharField(
        max_length=50,
        choices=[('Short', 'Short (<5 km)'), ('Medium', 'Medium (5-15 km)'), ('Long', 'Long (>15 km)')],
        blank=True, null=True
    )

    def __str__(self):
        return f"Preferences of {self.user.username}"

# =======================
# Emergency Contact
# =======================

class EmergencyContact(models.Model):
    """Emergency contacts tied to a user, used in SOS triggers."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='emergency_contacts')
    contact_name = models.CharField(max_length=100)
    phone_number = models.CharField(max_length=15)
    relationship = models.CharField(max_length=100, blank=True, null=True)
    is_primary = models.BooleanField(default=False)

    email = models.EmailField(blank=True, null=True)
    address = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'is_primary'],
                condition=models.Q(is_primary=True),
                name='unique_primary_contact'
            )
        ]

    def __str__(self):
        return f"{self.contact_name} ({self.relationship or 'Contact'})"

# =======================
# Follow Relationship
# =======================

class Follow(models.Model):
    """Social feature to follow other users."""
    follower = models.ForeignKey(User, on_delete=models.CASCADE, related_name='following')
    following = models.ForeignKey(User, on_delete=models.CASCADE, related_name='followers')
    followed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('follower', 'following')

    def __str__(self):
        return f"{self.follower.username} follows {self.following.username}"
