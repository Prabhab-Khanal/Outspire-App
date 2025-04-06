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
    phone_number = models.CharField(max_length=15, unique=True, blank=True, null=True)

    password = models.CharField(max_length=255, blank=True, null=True)
    profile_picture = models.ImageField(upload_to='profile_pictures/', blank=True, null=True)

    role = models.CharField(max_length=20, choices=USER_ROLES, default='Regular')

    # Verification & Onboarding Status
    is_email_verified = models.BooleanField(default=False)
    is_profile_complete = models.BooleanField(default=False)
    is_preference_complete = models.BooleanField(default=False)

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


class UserProfile(models.Model):
    user = models.OneToOneField('User', on_delete=models.CASCADE, related_name='profile')
    bio = models.TextField(blank=True)
    date_of_birth = models.DateField(blank=True, null=True)
    gender = models.CharField(max_length=20, choices=[('Male', 'Male'), ('Female', 'Female'), ('Other', 'Other')], blank=True)
    location = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return f"Profile of {self.user.username}"


class UserPreference(models.Model):
    user = models.OneToOneField('User', on_delete=models.CASCADE, related_name='preference')
    preferred_trail_type = models.CharField(max_length=100, blank=True)  # e.g., Mountain, Road
    preferred_difficulty = models.CharField(max_length=50, blank=True)   # Easy, Medium, Hard
    likes_group_rides = models.BooleanField(default=False)
    wants_event_notifications = models.BooleanField(default=True)

    def __str__(self):
        return f"Preference of {self.user.username}"
