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
        extra_fields.setdefault('role', 'Regular')  # Default role

        user = self.model(username=username, email=email, phone_number=phone_number, **extra_fields)
        if password:
            user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'Admin')  # Superusers are Admins
        return self.create_user(username, email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    """ Custom User Model for Authentication & Role-Based Access """

    user_id = models.BigAutoField(primary_key=True)  # Use default Integer ID instead of UUID
    username = models.CharField(max_length=50, unique=True)
    first_name = models.CharField(max_length=50)
    middle_name = models.CharField(max_length=50, blank=True, null=True)
    last_name = models.CharField(max_length=50)
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=15, unique=True, blank=True, null=True)  # Optional

    password = models.CharField(max_length=255, blank=True, null=True)  # Blank for Google users
    profile_picture = models.ImageField(upload_to='profile_pictures/', blank=True, null=True)

    role = models.CharField(max_length=20, choices=USER_ROLES, default='Regular')

    # Verification Status
    is_email_verified = models.BooleanField(default=False)

    # Soft Delete (Instead of Permanent Deletion)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)

    # Google login fields
    google_id = models.CharField(max_length=255, blank=True, null=True, unique=True)

    date_joined = models.DateTimeField(default=now)
    last_login = models.DateTimeField(blank=True, null=True)

    objects = UserManager()

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']

    def __str__(self):
        return self.username
