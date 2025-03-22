from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    """ Serializer for User Model (Profile) """

    class Meta:
        model = User
        fields = ['user_id', 'username', 'first_name', 'middle_name', 'last_name', 
                  'email', 'role', 'profile_picture', 
                  'is_email_verified', 'date_joined']
        read_only_fields = ['user_id', 'date_joined']  # These fields should not be editable


class RegisterSerializer(serializers.ModelSerializer):
    """ Serializer for User Registration (With Email OTP) """

    password = serializers.CharField(write_only=True, min_length=6, required=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def create(self, validated_data):
        """ Create and return a new user (Unverified Email Initially) """
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        user.is_email_verified = False  # User must verify email before full access
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    """ Serializer for User Login """

    username_or_email = serializers.CharField()
    password = serializers.CharField(write_only=True)


class EmailOTPSerializer(serializers.Serializer):
    """ Serializer for Email-Based OTP Verification """

    email = serializers.EmailField()
    otp = serializers.CharField()
    otp_type = serializers.ChoiceField(choices=["register", "reset"])


class ResetPasswordSerializer(serializers.Serializer):
    """ Serializer for Reset Password (After OTP Verification) """

    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=6, required=True)


class ProfileUpdateSerializer(serializers.ModelSerializer):
    """ Serializer for Updating User Profile """

    class Meta:
        model = User
        fields = ['first_name', 'middle_name', 'last_name', 'username', 'profile_picture']
