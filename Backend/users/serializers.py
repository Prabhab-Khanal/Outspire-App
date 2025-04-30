from rest_framework import serializers
from .models import User, UserPreference, EmergencyContact

# ============================
# 🔐 AUTH & VERIFICATION
# ============================

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
            raise serializers.ValidationError("Passwords do not match.")
        if User.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError("Email already in use.")
        if User.objects.filter(username=data['username']).exists():
            raise serializers.ValidationError("Username already taken.")
        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password', None)
        return User.objects.create_user(**validated_data)


class OTPVerifySerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField()
    otp_type = serializers.ChoiceField(choices=['register', 'reset', 'change_email'])


class LoginSerializer(serializers.Serializer):
    username_or_email = serializers.CharField()
    password = serializers.CharField(write_only=True)


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class ResetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField()
    new_password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError("Passwords do not match.")
        return data


class ChangeEmailRequestSerializer(serializers.Serializer):
    new_email = serializers.EmailField()


# ============================
# 👤 USER PROFILE
# ============================

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'user_id', 'first_name', 'middle_name', 'last_name',
            'username', 'email', 'phone_number', 'profile_picture',
            'bio', 'date_of_birth', 'gender', 'location',
            'role', 'is_email_verified', 'is_profile_complete',
            'is_emergencycontact_complete', 'is_preference_complete'
        ]


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'first_name', 'middle_name', 'last_name', 'phone_number',
            'email', 'username', 'profile_picture', 'bio',
            'date_of_birth', 'gender', 'location'
        ]


class PublicUserListSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'username', 'profile_picture', 'user_id', 'is_premium']


# ============================
# ⚙️ PREFERENCES & EMERGENCY
# ============================

class PreferenceSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = UserPreference
        fields = ['preferred_trail_type', 'preferred_difficulty', 'preferred_terrain', 'preferred_length', 'user_id']

    def create(self, validated_data):
        user_id = validated_data.pop('user_id')
        try:
            user = User.objects.get(user_id=user_id)
        except User.DoesNotExist:
            raise serializers.ValidationError("User with this ID does not exist.")

        if hasattr(user, 'preference'):
            raise serializers.ValidationError("Preferences already exist for this user.")

        preference = UserPreference.objects.create(user=user, **validated_data)
        user.is_preference_complete = True
        user.save()
        return preference


class UserPreferenceUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserPreference
        fields = ['preferred_trail_type', 'preferred_difficulty', 'preferred_terrain', 'preferred_length']

class UserPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserPreference
        fields = [
            'preferred_trail_type',
            'preferred_difficulty',
            'preferred_terrain',
            'preferred_length',
        ]

class EmergencyContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmergencyContact
        fields = ['contact_name', 'phone_number', 'relationship', 'is_primary', 'email', 'address', 'id']

    def validate_phone_number(self, value):
        if not value.isdigit() or len(value) < 10:
            raise serializers.ValidationError("Phone number must be at least 10 digits long and only contain numbers.")
        return value

    def validate_email(self, value):
        # You can add custom email validation logic if needed
        return value
class EmergencyContactUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmergencyContact
        fields = ['contact_name', 'phone_number', 'relationship', 'is_primary', 'email', 'address']


# ============================
# 🧩 COMPLETE PROFILE UPDATE
# ============================

class CompleteUserProfileUpdateSerializer(serializers.Serializer):
    user = UserProfileUpdateSerializer()
    preferences = UserPreferenceUpdateSerializer()
    emergency_contact = EmergencyContactUpdateSerializer()

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user')
        preferences_data = validated_data.pop('preferences', None)
        emergency_contact_data = validated_data.pop('emergency_contact', None)

        for field, value in user_data.items():
            setattr(instance, field, value)
        instance.save()

        if preferences_data:
            preference_instance, _ = UserPreference.objects.get_or_create(user=instance)
            for field, value in preferences_data.items():
                setattr(preference_instance, field, value)
            preference_instance.save()

        if emergency_contact_data:
            emergency_contact_instance, _ = EmergencyContact.objects.get_or_create(user=instance)
            for field, value in emergency_contact_data.items():
                setattr(emergency_contact_instance, field, value)
            emergency_contact_instance.save()

        return instance
