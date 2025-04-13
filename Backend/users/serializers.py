from rest_framework import serializers
from .models import User, UserPreference, EmergencyContact

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'confirm_password', 
            'first_name', 'middle_name', 'last_name', 'phone_number', 
            'profile_picture', 'bio', 'date_of_birth', 'gender', 
            'location', 'role'
        ]

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError("Passwords do not match")
        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password', None)
        user = User.objects.create_user(**validated_data)
        return user

class OTPVerifySerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField()
    otp_type = serializers.ChoiceField(choices=['register', 'reset'])

class LoginSerializer(serializers.Serializer):
    username_or_email = serializers.CharField()
    password = serializers.CharField(write_only=True)

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'middle_name', 'last_name', 'phone_number', 
                  'profile_picture', 'bio', 'date_of_birth', 'gender', 'location']

class PreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserPreference
        fields = ['preferred_trail_type', 'preferred_difficulty', 'preferred_terrain', 'preferred_length']

class EmergencyContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmergencyContact
        fields = ['contact_name', 'phone_number', 'relationship', 'is_primary', 'email', 'address']
