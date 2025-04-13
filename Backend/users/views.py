from django.core.mail import send_mail
from django.core.cache import cache
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings
import random
from rest_framework.permissions import IsAuthenticated
from google.oauth2 import id_token
from google.auth.transport.requests import Request

from .models import User, UserPreference, EmergencyContact
from .serializers import RegisterSerializer, OTPVerifySerializer, LoginSerializer, ProfileSerializer, PreferenceSerializer, EmergencyContactSerializer

OTP_EXPIRATION_TIME = 30000  # 5 minutes expiration time for OTP

# User Registration with OTP
class RegisterUserView(APIView):
    def post(self, request):
        data = request.data
        serializer = RegisterSerializer(data=data)

        if serializer.is_valid():
            # Create the user
            user = serializer.save()
            user.is_email_verified = False  # Email is not verified yet
            user.save()

            # Generate OTP
            otp = str(random.randint(100000, 999999))
            otp_key = f"otp_{user.email}"
            cache.set(otp_key, otp, timeout=OTP_EXPIRATION_TIME)

            # Send OTP email
            send_mail(
                subject="Your OTP Code for Registration",
                message=f"Your OTP code is: {otp}",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False,
            )

            return Response({"message": "Registration successful. Please verify your email with the OTP."}, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# OTP Verification
class VerifyOTPView(APIView):
    def post(self, request):
        # Ensure you get the correct OTP from the request data
        email = request.data.get('email')
        otp = request.data.get('otp')
        otp_type = request.data.get('otp_type')

        # Construct the cache key with email and OTP type
        otp_key = f"otp_{email}"

        # Debugging the cache key and stored OTP
        print(f"Verifying OTP for {email} with key {otp_key}")
        
        # Fetch the OTP from cache using the same key
        stored_otp = cache.get(otp_key)

        # Debugging: Check what's retrieved from cache
        print(f"Stored OTP: {stored_otp}")

        if stored_otp == otp:
            # OTP matches, mark the email as verified
            user = User.objects.get(email=email)
            user.is_email_verified = True
            user.save()

            # Clear the OTP from cache
            cache.delete(otp_key)

            return Response({"message": "OTP verified successfully. Your email is now verified."}, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Invalid or expired OTP."}, status=status.HTTP_400_BAD_REQUEST)





# User Login
class LoginUserView(APIView):
    def post(self, request):
        data = request.data
        serializer = LoginSerializer(data=data)

        if serializer.is_valid():
            identifier = data.get("username_or_email")
            password = data.get("password")

            user = User.objects.filter(email=identifier).first() or User.objects.filter(username=identifier).first()

            if user and user.check_password(password):
                # If email is not verified, redirect to OTP verify page
                if not user.is_email_verified:
                    return Response({
                        "error": "Email not verified. Please verify your email.",
                        "redirect_to_otp": True,  # Flag to indicate frontend should navigate to OTP screen
                        "email": user.email  # Send email for OTP verification purpose
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                # If profile or preferences are incomplete, send flags
                return Response({
                    "access_token": str(RefreshToken.for_user(user).access_token),
                    "refresh_token": str(RefreshToken.for_user(user)),
                    "is_email_verified": user.is_email_verified,
                    "is_profile_complete": user.is_profile_complete,
                    "is_preference_complete": user.is_preference_complete,
                    "is_emergencycontact_complete": user.is_emergencycontact_complete,
                    'role': user.role,
                })

            return Response({"error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)




# Create or Update Profile
class CreateProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Check if the user already has a profile
        if hasattr(request.user, 'profile'):
            return Response({"error": "Profile already exists."}, status=status.HTTP_400_BAD_REQUEST)

        serializer = ProfileSerializer(data=request.data)
        if serializer.is_valid():
            # Save the profile
            serializer.save(user=request.user)
            request.user.is_profile_complete = True  # Mark profile as complete
            request.user.save()
            return Response({"message": "Profile created successfully."}, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Update Profile
class UpdateProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        profile = getattr(request.user, 'profile', None)
        if not profile:
            return Response({"error": "Profile not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = ProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Profile updated successfully."}, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Create Preferences
class CreatePreferenceView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Check if the user already has preferences
        if hasattr(request.user, 'preference'):
            return Response({"error": "Preferences already exist."}, status=status.HTTP_400_BAD_REQUEST)

        serializer = PreferenceSerializer(data=request.data)
        if serializer.is_valid():
            # Save the preferences
            serializer.save(user=request.user)
            request.user.is_preference_complete = True  # Mark preferences as complete
            request.user.save()
            return Response({"message": "Preferences created successfully."}, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Update Preferences
class UpdatePreferenceView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        preference = getattr(request.user, 'preference', None)
        if not preference:
            return Response({"error": "Preferences not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = PreferenceSerializer(preference, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Preferences updated successfully."}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class CreateEmergencyContactView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user  # Get the logged-in user

        # Check if the user is Premium or Regular
        if user.role == 'Regular':
            limit = 3  # Regular users can only have up to 3 emergency contacts
        else:
            limit = 5  # Premium users can have up to 5 emergency contacts

        # Count existing emergency contacts for the user
        existing_contacts = EmergencyContact.objects.filter(user=user).count()

        if existing_contacts >= limit:
            # If user has reached the limit, prompt to upgrade
            return Response(
                {"error": f"You have reached the limit of {limit} emergency contacts. Upgrade to Premium to add more."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Serialize and save new emergency contact
        serializer = EmergencyContactSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=user)
            return Response({"message": "Emergency contact added successfully."}, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UpdateEmergencyContactView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        user = request.user  # Get the logged-in user

        # Check if the user is Premium or Regular
        if user.role == 'Regular':
            limit = 3  # Regular users can only have up to 3 emergency contacts
        else:
            limit = 5  # Premium users can have up to 5 emergency contacts

        # Check if the user already has the maximum allowed contacts
        if EmergencyContact.objects.filter(user=user).count() >= limit:
            if user.role == 'Regular':
                # If the user has 3 contacts and tries to update/add more, prompt to upgrade
                return Response(
                    {"error": f"You have reached the limit of {limit} emergency contacts. Upgrade to Premium to add more."},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Update the existing contact (for users with less than the limit)
        contact_id = request.data.get('id')  # Assuming contact id is sent for update
        try:
            contact = EmergencyContact.objects.get(id=contact_id, user=user)
        except EmergencyContact.DoesNotExist:
            return Response({"error": "Emergency contact not found."}, status=status.HTTP_404_NOT_FOUND)

        # Serialize and update the emergency contact
        serializer = EmergencyContactSerializer(contact, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Emergency contact updated successfully."}, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



# Forgot Password: Generate OTP to Reset Password
class ForgotPasswordView(APIView):
    def post(self, request):
        email = request.data.get("email")
        if not email:
            return Response({"error": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)

        # Check if user exists
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        # Generate OTP for password reset
        otp = str(random.randint(100000, 999999))
        otp_key = f"otp_reset_{email}"
        cache.set(otp_key, otp, timeout=OTP_EXPIRATION_TIME)

        # Send OTP to user's email
        send_mail(
            subject="Your OTP Code for Password Reset",
            message=f"Your OTP code is: {otp}",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
        )

        return Response({"message": "OTP sent successfully to your email."}, status=status.HTTP_200_OK)


# Forgot Password: Verify OTP and Reset Password
class ResetPasswordView(APIView):
    def post(self, request):
        serializer = OTPVerifySerializer(data=request.data)

        if serializer.is_valid():
            email = serializer.validated_data['email']
            otp = serializer.validated_data['otp']
            otp_type = serializer.validated_data['otp_type']

            stored_otp = cache.get(f"otp_{otp_type}_{email}")
            if stored_otp == otp:
                # Reset Password
                new_password = request.data.get("new_password")
                user = User.objects.get(email=email)
                user.set_password(new_password)
                user.save()

                # Clear OTP from cache
                cache.delete(f"otp_{otp_type}_{email}")

                return Response({"message": "Password reset successfully."}, status=status.HTTP_200_OK)

            return Response({"error": "Invalid or expired OTP."}, status=status.HTTP_400_BAD_REQUEST)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


from google.oauth2 import id_token
from google.auth.transport.requests import Request

# Google Login
class GoogleLoginView(APIView):
    def post(self, request):
        # Google ID token
        google_id_token = request.data.get('google_id_token')

        if not google_id_token:
            return Response({"error": "Google ID token is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Verify Google ID token
            idinfo = id_token.verify_oauth2_token(google_id_token, Request(), settings.GOOGLE_CLIENT_ID)

            # Check if the ID token is valid and extract the email
            google_id = idinfo['sub']
            email = idinfo['email']
            username = idinfo.get('name', email.split('@')[0])  # Default username is email before '@'

            # Check if user exists
            user, created = User.objects.get_or_create(
                email=email,
                defaults={"username": username, "google_id": google_id, "is_email_verified": True}
            )

            # Create JWT tokens for the user
            refresh = RefreshToken.for_user(user)
            return Response({
                "access_token": str(refresh.access_token),
                "refresh_token": str(refresh),
                "message": "Google login successful"
            })

        except ValueError:
            return Response({"error": "Invalid Google ID token."}, status=status.HTTP_400_BAD_REQUEST)




from django.core.cache import cache
from django.core.mail import send_mail
import random
from rest_framework.response import Response
from rest_framework import status

# OTP Generation and Cache Storage
class GenerateOTPForEmailVerificationView(APIView):
    def post(self, request):
        # Check if the email exists
        email = request.data.get('email')
        if not email:
            return Response({"error": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "User with this email does not exist."}, status=status.HTTP_404_NOT_FOUND)

        # Check if the email is already verified
        if user.is_email_verified:
            return Response({"message": "Email is already verified."}, status=status.HTTP_200_OK)

        # Generate OTP
        otp = str(random.randint(100000, 999999))  # Generate a 6-digit OTP
        otp_key = f"otp_{user.email}"  # Cache key specific to the email
        
        try:
            # Store OTP in cache with the correct key (otp_key)
            cache.set(otp_key, otp, timeout=OTP_EXPIRATION_TIME)

            # Debugging line: retrieve the OTP using the correct key (otp_key)
            stored_otp = cache.get(otp_key)
            
            print(f"OTP stored for {user.email}: {stored_otp}")  # Print the stored OTP

        except Exception as e:
            print(f"Cache error: {str(e)}")  # Log any cache errors



        # Send OTP to user's email
        send_mail(
            subject="Your OTP Code for Email Verification",
            message=f"Your OTP code for email verification is: {otp}",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )

        # Return response indicating OTP was sent
        return Response({
            "message": "OTP sent successfully to your email.",
            "redirect_to_otp": True,
            "email": user.email,
            "otp_type": "register"  # OTP type is register for email verification
        }, status=status.HTTP_200_OK)

