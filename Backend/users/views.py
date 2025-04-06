from django.core.cache import cache
from django.core.mail import send_mail
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.response import Response
from rest_framework import status
import random, json

from .models import User, UserProfile, UserPreference
from .serializers import (
    UserSerializer, RegisterSerializer, LoginSerializer,
    OTPVerifySerializer, ResetPasswordSerializer,
    ProfileSerializer, PreferenceSerializer
)

# OTP settings
OTP_EXPIRATION_TIME = 300


### 🔹 REGISTER USER WITH OTP ###
class RegisterUserView(APIView):
    def post(self, request):
        data = request.data
        serializer = RegisterSerializer(data=data)

        email = data.get("email")
        otp = data.get("otp")
        otp_key = f"otp_register_{email}"

        if not otp or cache.get(otp_key) != otp:
            return JsonResponse({"error": "Invalid or expired OTP"}, status=400)

        if serializer.is_valid():
            user = serializer.save()
            user.is_email_verified = True
            user.save()
            cache.delete(otp_key)
            return JsonResponse({"success": "User registered successfully"}, status=201)

        return JsonResponse(serializer.errors, status=400)


### 🔹 LOGIN ###
class LoginUserView(APIView):
    def post(self, request):
        data = request.data
        identifier = data.get("username_or_email")
        password = data.get("password")

        user = User.objects.filter(email=identifier).first() or User.objects.filter(username=identifier).first()

        if user and user.check_password(password):
            refresh = RefreshToken.for_user(user)
            return JsonResponse({
                "access_token": str(refresh.access_token),
                "refresh_token": str(refresh),
                "is_email_verified": user.is_email_verified,
                "is_profile_complete": user.is_profile_complete,
                "is_preference_complete": user.is_preference_complete
            })

        return JsonResponse({"error": "Invalid credentials"}, status=400)


### 🔹 LOGOUT ###
class LogoutUserView(APIView):
    def post(self, request):
        try:
            request_data = json.loads(request.body.decode('utf-8'))
            token = RefreshToken(request_data.get("refresh_token"))
            token.blacklist()
            return JsonResponse({"success": "Logged out successfully"})
        except Exception as e:
            return JsonResponse({"error": "Invalid token"}, status=400)


### 🔹 GOOGLE LOGIN ###
class GoogleLoginView(APIView):
    def post(self, request):
        data = request.data
        google_id = data.get("google_id")
        email = data.get("email")
        username = data.get("username")

        if not google_id or not email:
            return JsonResponse({"error": "Missing Google credentials"}, status=400)

        user, created = User.objects.get_or_create(
            email=email,
            defaults={"username": username, "google_id": google_id, "is_email_verified": True}
        )

        refresh = RefreshToken.for_user(user)
        return JsonResponse({
            "access_token": str(refresh.access_token),
            "refresh_token": str(refresh),
            "message": "Google login successful"
        })


### 🔹 GENERATE OTP ###
class GenerateOTPView(APIView):
    def post(self, request):
        email = request.data.get("email")
        otp_type = request.data.get("otp_type")  # register or reset

        if otp_type not in ["register", "reset"]:
            return JsonResponse({"error": "Invalid OTP type"}, status=400)

        otp = str(random.randint(100000, 999999))
        cache.set(f"otp_{otp_type}_{email}", otp, timeout=OTP_EXPIRATION_TIME)

        send_mail(
            subject="Your OTP Code",
            message=f"Your OTP code is: {otp}",
            from_email="noreply@outspire.com",
            recipient_list=[email],
            fail_silently=False,
        )

        return JsonResponse({"message": "OTP sent successfully"})


### 🔹 VERIFY OTP ###
class VerifyOTPView(APIView):
    def post(self, request):
        serializer = OTPVerifySerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            otp = serializer.validated_data['otp']
            otp_type = serializer.validated_data['otp_type']

            stored_otp = cache.get(f"otp_{otp_type}_{email}")
            if stored_otp == otp:
                return JsonResponse({"success": "OTP verified"})
        return JsonResponse({"error": "Invalid OTP"}, status=400)


### 🔹 RESET PASSWORD ###
class ResetPasswordView(APIView):
    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = User.objects.filter(email=serializer.validated_data['email']).first()
            if user:
                user.set_password(serializer.validated_data['password'])
                user.save()
                return JsonResponse({"success": "Password reset successful"})
        return JsonResponse({"error": "User not found or invalid"}, status=400)


### 🔹 CREATE PROFILE ###
class CreateProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if hasattr(request.user, 'profile'):
            return Response({"error": "Profile already exists"}, status=400)

        serializer = ProfileSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            request.user.is_profile_complete = True
            request.user.save()
            return Response({"success": "Profile created"})
        return Response(serializer.errors, status=400)


### 🔹 UPDATE PROFILE ###
class UpdateProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        profile = getattr(request.user, 'profile', None)
        if not profile:
            return Response({"error": "Profile not found"}, status=404)

        serializer = ProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"success": "Profile updated"})
        return Response(serializer.errors, status=400)


### 🔹 CREATE PREFERENCE ###
class CreatePreferenceView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if hasattr(request.user, 'preference'):
            return Response({"error": "Preferences already exist"}, status=400)

        serializer = PreferenceSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            request.user.is_preference_complete = True
            request.user.save()
            return Response({"success": "Preferences created"})
        return Response(serializer.errors, status=400)


### 🔹 UPDATE PREFERENCE ###
class UpdatePreferenceView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        pref = getattr(request.user, 'preference', None)
        if not pref:
            return Response({"error": "Preferences not found"}, status=404)

        serializer = PreferenceSerializer(pref, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"success": "Preferences updated"})
        return Response(serializer.errors, status=400)


### 🔹 GET USER DASHBOARD DATA ###
class UserDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_data = UserSerializer(request.user).data
        profile_data = ProfileSerializer(getattr(request.user, 'profile', None)).data if hasattr(request.user, 'profile') else None
        preference_data = PreferenceSerializer(getattr(request.user, 'preference', None)).data if hasattr(request.user, 'preference') else None

        return Response({
            "user": user_data,
            "profile": profile_data,
            "preference": preference_data
        })
