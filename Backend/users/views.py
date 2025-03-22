from django.shortcuts import render

# Create your views here.
import json
from django.contrib.auth import authenticate
from django.core.cache import cache
from django.http import JsonResponse
from django.utils.timezone import now
import random
from django.core.mail import send_mail
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User
from .serializers import UserSerializer

# OTP Settings
OTP_EXPIRATION_TIME = 300  # 5 minutes
MAX_OTP_ATTEMPTS = 5
BLOCK_DURATION = 600  # 10 minutes block

### 🔹 USER REGISTRATION (With Email OTP Verification) ###
class RegisterUserView(APIView):
    def post(self, request):
        """ Register a new user (Requires OTP Verification) """

        data = request.data
        username = data.get("username")
        email = data.get("email")
        password = data.get("password")

        if User.objects.filter(email=email).exists():
            return JsonResponse({"error": "Email already registered"}, status=400)

        # Check OTP Verification
        otp_cache_key = f"otp_register_{email}"
        stored_otp = cache.get(otp_cache_key)

        if not stored_otp or stored_otp != data.get("otp"):
            return JsonResponse({"error": "Invalid or expired OTP"}, status=400)

        # Create User
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password
        )
        user.is_email_verified = True
        user.save()

        cache.delete(otp_cache_key)  # Remove OTP from cache after verification
        return JsonResponse({"success": "User registered successfully"}, status=201)


### 🔹 LOGIN (Username/Email + Password) ###
class LoginUserView(APIView):
    def post(self, request):
        """ User login using username/email + password """

        data = request.data
        username_or_email = data.get("username_or_email")
        password = data.get("password")

        # Identify login field (email or username)
        user = User.objects.filter(
            email=username_or_email
        ).first() or User.objects.filter(
            username=username_or_email
        ).first()

        if user and user.check_password(password):
            refresh = RefreshToken.for_user(user)
            return JsonResponse({
                "access_token": str(refresh.access_token),
                "refresh_token": str(refresh)
            })
        
        return JsonResponse({"error": "Invalid credentials"}, status=400)

### 🔹 LOGOUT (Blacklist Refresh Token) ###
class LogoutUserView(APIView):
    def post(self, request):
        """ Logout user by blacklisting the refresh token """

        try:
            # Print request body for debugging
            request_data = json.loads(request.body.decode('utf-8'))
            print("Received Request Data:", request_data)

            refresh_token = request_data.get("refresh_token")

            if not refresh_token:
                return JsonResponse({"error": "Refresh token is required for logout"}, status=400)

            # Check if refresh token is valid
            token = RefreshToken(refresh_token)

            # Blacklist the refresh token
            token.blacklist()

            return JsonResponse({"success": "User logged out successfully"}, status=200)

        except Exception as e:
            print("Logout Error:", str(e))  # Debugging logs
            return JsonResponse({"error": "Invalid or expired token"}, status=400)


### 🔹 GOOGLE LOGIN (OAuth2-Based Authentication) ###
class GoogleLoginView(APIView):
    def post(self, request):
        """ Google OAuth2 Login (Requires Google Token) """

        data = request.data
        google_id = data.get("google_id")
        email = data.get("email")
        username = data.get("username")

        if not google_id or not email:
            return JsonResponse({"error": "Invalid Google credentials"}, status=400)

        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                "username": username,
                "google_id": google_id,
                "is_email_verified": True,
            }
        )

        refresh = RefreshToken.for_user(user)
        return JsonResponse({
            "access_token": str(refresh.access_token),
            "refresh_token": str(refresh),
            "message": "Google login successful"
        })


### 🔹 GENERATE OTP (For Registration & Forgot Password) ###
class GenerateOTPView(APIView):
    def post(self, request):
        """ Generate OTP for registration or password reset """

        email = request.data.get("email")
        otp_type = request.data.get("otp_type")  # "register" or "reset"

        if otp_type not in ["register", "reset"]:
            return JsonResponse({"error": "Invalid OTP type"}, status=400)

        otp_cache_key = f"otp_{otp_type}_{email}"
        otp_attempts_key = f"otp_attempts_{otp_type}_{email}"
        otp_block_key = f"otp_block_{otp_type}_{email}"

        if cache.get(otp_block_key):
            return JsonResponse({"error": "Too many incorrect attempts. Try again later."}, status=429)

        otp = str(random.randint(100000, 999999))
        cache.set(otp_cache_key, otp, timeout=OTP_EXPIRATION_TIME)
        cache.set(otp_attempts_key, 0, timeout=OTP_EXPIRATION_TIME)

        # Send OTP via Email (Replace with actual email sending logic)
        send_mail(
            subject="Your OTP Code",
            message=f"Your OTP code for {otp_type} is {otp}",
            from_email="no-reply@outspire.com",
            recipient_list=[email],
            fail_silently=False,
        )

        return JsonResponse({"message": "OTP sent successfully"})


### 🔹 VERIFY OTP (For Registration & Forgot Password) ###
class VerifyOTPView(APIView):
    def post(self, request):
        """ Verify OTP for registration or password reset """

        email = request.data.get("email")
        entered_otp = request.data.get("otp")
        otp_type = request.data.get("otp_type")

        otp_cache_key = f"otp_{otp_type}_{email}"
        stored_otp = cache.get(otp_cache_key)

        if stored_otp and entered_otp == stored_otp:
            cache.delete(otp_cache_key)
            return JsonResponse({"success": f"{otp_type} OTP verified successfully"})

        return JsonResponse({"error": "Invalid OTP"}, status=400)


### 🔹 RESET PASSWORD ###
class ResetPasswordView(APIView):
    def post(self, request):
        """ Reset user password after OTP verification """

        email = request.data.get("email")
        new_password = request.data.get("password")

        user = User.objects.filter(email=email).first()

        if user:
            user.set_password(new_password)
            user.save()
            return JsonResponse({"success": "Password reset successful"})

        return JsonResponse({"error": "User not found"}, status=400)


### 🔹 UPDATE PROFILE (Authenticated Users Only) ###
class UpdateProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        """ Update user profile (Name, Username, Profile Picture) """

        user = request.user
        data = request.data

        user.first_name = data.get("first_name", user.first_name)
        user.last_name = data.get("last_name", user.last_name)
        user.username = data.get("username", user.username)
        user.profile_picture = data.get("profile_picture", user.profile_picture)
        user.save()

        return JsonResponse({"success": "Profile updated successfully"})


### 🔹 DEACTIVATE ACCOUNT (Soft Delete) ###
class DeactivateAccountView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """ Soft delete user account """

        user = request.user
        user.is_active = False
        user.save()
        return JsonResponse({"success": "Account deactivated successfully"})
