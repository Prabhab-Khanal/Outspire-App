from rest_framework import serializers
from .models import User, UserProfile, UserPreference

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'user_id', 'username', 'first_name', 'middle_name', 'last_name',
            'email', 'phone_number', 'profile_picture',
            'role', 'is_email_verified', 'is_profile_complete', 'is_preference_complete',
            'date_joined'
        ]
        read_only_fields = ['user_id', 'date_joined', 'is_email_verified']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'first_name',
            'middle_name', 'last_name', 'phone_number', 'profile_picture'
        ]

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            middle_name=validated_data.get('middle_name', ''),
            last_name=validated_data.get('last_name', ''),
            phone_number=validated_data.get('phone_number', ''),
        )
        if validated_data.get('profile_picture'):
            user.profile_picture = validated_data['profile_picture']
        user.save()
        return user

class LoginSerializer(serializers.Serializer):
    username_or_email = serializers.CharField()
    password = serializers.CharField(write_only=True)


class OTPVerifySerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)
    otp_type = serializers.ChoiceField(choices=["register", "reset"])


class ResetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(min_length=6)


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['bio', 'date_of_birth', 'gender', 'location']


class PreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserPreference
        fields = [
            'preferred_trail_type',
            'preferred_difficulty',
            'likes_group_rides',
            'wants_event_notifications',
        ]
