from django.core.mail import send_mail
from django.core.cache import cache
from django.conf import settings
from django.forms import ValidationError
from django.shortcuts import get_object_or_404
from django.contrib.auth.hashers import make_password
from rest_framework.views import APIView
from rest_framework.generics import RetrieveAPIView, ListAPIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User, UserPreference, EmergencyContact
from .serializers import (
    RegisterSerializer, OTPVerifySerializer, LoginSerializer, UserPreferenceSerializer, UserProfileSerializer,
    UserProfileUpdateSerializer, PreferenceSerializer, UserPreferenceUpdateSerializer,
    EmergencyContactSerializer, EmergencyContactUpdateSerializer, 
    CompleteUserProfileUpdateSerializer, PublicUserListSerializer,
    PasswordResetRequestSerializer, ResetPasswordSerializer, ChangeEmailRequestSerializer
)
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
import random


class RegisterUserView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save(is_email_verified=False, is_profile_complete = True)
            
            # Generate OTP and store it in cache
            otp = str(random.randint(100000, 999999))
            cache.set(f"otp_register_{user.email}", otp, timeout=300)
            print ('the  otp for register is' ,otp)
            print('the cache stored otp is', )

            # Send OTP via email
            send_mail(
                subject="Verify Your Email - OTP Code",
                message=f"Your OTP code is: {otp}",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False,
            )

            return Response({
                "message": "Registration successful. Please verify your email with the OTP.",
                "email": user.email
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VerifyOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        payload  = request.data.get("data", request.data)
        email    = payload.get("email")
        otp      = payload.get("otp")
        otp_type = payload.get("otp_type")

        # Debug inputs
        print(f"[VerifyOTP] Received data: email={email!r}, otp={otp!r}, otp_type={otp_type!r}")

        key = f"otp_{otp_type}_{email}"
        print(f"[VerifyOTP] Computed cache key: {key!r}")

        stored_otp = cache.get(key)
        print(f"[VerifyOTP] Stored OTP from cache: {stored_otp!r}")

        if stored_otp == otp:
            print("[VerifyOTP] OTP matches stored value")
            try:
                user = User.objects.get(email=email)
                print(f"[VerifyOTP] Found user: {user!r}")

                if otp_type == "register":
                    user.is_email_verified = True
                    print("[VerifyOTP] Marking user email as verified")

                user.save()
                print("[VerifyOTP] User saved successfully")

                cache.delete(key)
                print(f"[VerifyOTP] Deleted OTP from cache: {key!r}")

                return Response({"message": "OTP verified successfully."}, status=200)
            except User.DoesNotExist:
                print(f"[VerifyOTP] No user found with email: {email!r}")
                return Response({"error": "User not found."}, status=404)

        # OTP did not match
        print("[VerifyOTP] Invalid or expired OTP")
        return Response({"error": "Invalid or expired OTP."}, status=400)



class LoginUserView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data
        identifier = data.get("username_or_email")
        password = data.get("password")

        user = User.objects.filter(email=identifier).first() or User.objects.filter(username=identifier).first()

        if user and user.check_password(password):
            if not user.is_email_verified:
                new_otp = f"{random.randint(0, 999999):06d}"

                # cache it under the same key your VerifyOTPView expects
                cache.set(f"otp_register_{user.email}", new_otp, timeout=300)

                # send it right away
                send_mail(
                "Your verification code",
                f"Your OTP is {new_otp}",
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                fail_silently=True
                )

                # now return exactly as before
                return Response({
                "error": "Email not verified. Please verify your email.",
                "redirect_to_otp": True,
                "email": user.email
                }, status=400)

            refresh = RefreshToken.for_user(user)
            return Response({
                "message": "Login successful.",
                "access_token": str(refresh.access_token),
                "refresh_token": str(refresh),
                "user_id": user.user_id,
                "username": user.username,
                "role": user.role,
                "is_profile_complete": user.is_profile_complete,
                "is_preference_complete": user.is_preference_complete,
                "is_emergencycontact_complete": user.is_emergencycontact_complete,
                "premium":user.is_premium,
            }, status=200)


        return Response({"error": "Invalid credentials."}, status=400)


from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from rest_framework_simplejwt.tokens import RefreshToken

class GoogleLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get('google_id_token')

        if not token:
            return Response({"error": "Google ID token is required."}, status=400)

        try:
            idinfo = id_token.verify_oauth2_token(token, google_requests.Request(), settings.GOOGLE_CLIENT_ID)

            google_id_val = idinfo['sub']
            email = idinfo['email']
            username = idinfo.get('name', email.split('@')[0])  #

            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'username': username,
                    'google_id': google_id_val,
                    'is_email_verified': True,
                    'role': 'Regular'
                }
            )

            # Prevent hybrid conflict: if user exists with email but no google_id
            if not created and user.google_id is None:
                return Response({
                    "error": "This email is already registered with a password login."
                }, status=400)

            # Issue tokens
            refresh = RefreshToken.for_user(user)

            return Response({
                "message": "Google login successful.",
                "access_token": str(refresh.access_token),
                "refresh_token": str(refresh),
                "user_id": user.user_id,
                "username": user.username,
                "role": user.role,
                "is_profile_complete": user.is_profile_complete,
                "is_preference_complete": user.is_preference_complete,
                "is_emergencycontact_complete": user.is_emergencycontact_complete,
            })

        except ValueError:
            return Response({"error": "Invalid Google ID token."}, status=400)


class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']

            try:
                User.objects.get(email=email)
                otp = str(random.randint(100000, 999999))
                cache.set(f"otp_reset_{email}", otp, timeout=300)

                send_mail(
                    subject="Reset Your Password - OTP",
                    message=f"Your OTP code is: {otp}",
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[email],
                    fail_silently=False,
                )

                return Response({"message": "OTP sent to your email."}, status=200)

            except User.DoesNotExist:
                return Response({"error": "No user found with this email."}, status=404)

        return Response(serializer.errors, status=400)


class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data["email"]
            otp = serializer.validated_data["otp"]
            key = f"otp_reset_{email}"
            stored_otp = cache.get(key)

            if stored_otp == otp:
                try:
                    user = User.objects.get(email=email)
                    user.set_password(serializer.validated_data["new_password"])
                    user.save()
                    cache.delete(key)
                    return Response({"message": "Password reset successful."}, status=200)
                except User.DoesNotExist:
                    return Response({"error": "User not found."}, status=404)

            return Response({"error": "Invalid or expired OTP."}, status=400)

        return Response(serializer.errors, status=400)


class ResendOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email    = request.data.get("email")
        otp_type = request.data.get("otp_type")

        if not email or not otp_type:
            return Response(
                {"error": "Email and otp_type are required."},
                status=400
            )

        # 1) Generate a new 6-digit numeric OTP
        new_otp = f"{random.randint(0, 999999):06d}"

        # 2) Cache it for, say, 5 minutes
        key = f"otp_{otp_type}_{email}"
        cache.set(key, new_otp, timeout=300)

        # 3) Send it via email
        subject = "Your Verification Code"
        message = f"Your verification code is: {new_otp}"
        from_email = settings.DEFAULT_FROM_EMAIL
        try:
            send_mail(subject, message, from_email, [email])
        except Exception as e:
            print("Send mail error:", str(e))  # Log error in server
            return Response({"error": "Failed to send email."}, status=500)

        return Response(
            {"message": "OTP resent successfully."},
            status=200
        )





class GetProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data, status=200)


class UpdateUserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        serializer = UserProfileUpdateSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Profile updated successfully."}, status=200)
        return Response(serializer.errors, status=400)

class CreatePreferenceView(APIView): 

    def post(self, request):
        serializer = PreferenceSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Preferences created successfully."}, status=201)
        return Response(serializer.errors, status=400)

class GetUserPreferenceView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            preference = request.user.preference  # Assuming OneToOneField from user to preference
            serializer = UserPreferenceSerializer(preference)
            return Response(serializer.data, status=200)
        except UserPreference.DoesNotExist:
            return Response({"error": "Preferences not found."}, status=404)

class UpdateUserPreferenceView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        try:
            preference = request.user.preference  # OneToOne field
            serializer = UserPreferenceUpdateSerializer(preference, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({"message": "Preferences updated successfully."}, status=200)
            return Response(serializer.errors, status=400)
        except UserPreference.DoesNotExist:
            return Response({"error": "Preferences not found."}, status=404)


# views.py
# views.py
class CreateEmergencyContactView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        print(f"Received data: {request.data}")  # Log the request data
        serializer = EmergencyContactSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response({"message": "Emergency contact added."}, status=201)
        
        print(f"Validation errors: {serializer.errors}")  # Log validation errors
        return Response(serializer.errors, status=400)


class UpdateEmergencyContactView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        contact_id = request.data.get('id')

        try:
            contact = EmergencyContact.objects.get(id=contact_id, user=request.user)
            serializer = EmergencyContactSerializer(contact, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({"message": "Emergency contact updated successfully."}, status=200)
            return Response({"errors": serializer.errors}, status=400)
        except EmergencyContact.DoesNotExist:
            return Response({"error": "Emergency contact not found."}, status=404)

class GetEmergencyContactView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        print("🚀 Fetching emergency contact for user:", request.user.user_id)  # Log the user ID for the request
        
        contacts = EmergencyContact.objects.filter(user=request.user)
        if contacts.exists():
            serializer = EmergencyContactSerializer(contacts, many=True)
            return Response(serializer.data)
        else:
            return Response({"error": "No emergency contacts found"}, status=404)

        


class DeleteEmergencyContactView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        contact_id = request.data.get('contact_id')  # Make sure 'contact_id' is being passed

        if not contact_id:
            return Response({"error": "Contact ID is required."}, status=400)

        try:
            # Fetch the emergency contact by ID and ensure it belongs to the current user
            contact = EmergencyContact.objects.get(id=contact_id, user=request.user)
            contact.delete()  # Delete the contact from the database
            return Response({"message": "Emergency contact deleted successfully."}, status=200)
        except EmergencyContact.DoesNotExist:
            return Response({"error": "Emergency contact not found."}, status=404)

class PublicUserProfileView(RetrieveAPIView):
    permission_classes = [AllowAny]

    def get(self, request, username):
        user = get_object_or_404(User, username=username)
        serializer = UserProfileSerializer(user)
        return Response(serializer.data)



class UserListView(ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = PublicUserListSerializer

    def get_queryset(self):
        search = self.request.query_params.get('search')
        if search:
            return User.objects.filter(username__icontains=search)
        return User.objects.all()


from .models import Follow

class FollowToggleView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        target_username = request.data.get("username")
        target_user = get_object_or_404(User, username=target_username)

        if target_user == request.user:
            return Response({"error": "You cannot follow yourself."}, status=400)

        follow_obj, created = Follow.objects.get_or_create(
            follower=request.user,
            following=target_user
        )

        if not created:
            follow_obj.delete()
            return Response({"message": "Unfollowed."})
        else:
            return Response({"message": "Followed."})


class FollowStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        username = request.query_params.get("username")
        target_user = get_object_or_404(User, username=username)

        is_following = Follow.objects.filter(follower=request.user, following=target_user).exists()
        return Response({"is_following": is_following}, status=200)




class FollowedUsersListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        follows = Follow.objects.filter(follower=request.user)
        users = [f.following for f in follows]
        serializer = PublicUserListSerializer(users, many=True, context={"request": request})
        return Response(serializer.data)



class CheckUsernameEmailView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email', '').lower()
        username = request.data.get('username', '')

        errors = {}

        if User.objects.filter(email=email).exists():
            errors['email'] = 'Email is already registered.'

        if User.objects.filter(username=username).exists():
            errors['username'] = 'Username is already taken.'

        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({"message": "Email and Username are available."}, status=status.HTTP_200_OK)
    


class CheckPhoneNumberView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        phone_number = request.data.get('phone_number', '')

        if User.objects.filter(phone_number=phone_number).exists():
            return Response({"phone_number": "Phone number is already registered."}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"message": "Phone number is available."}, status=status.HTTP_200_OK)


class ResetPasswordAfterOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        print(request.data)
        email = request.data.get('email', '').strip().lower()
        new_password = request.data.get('new_password', '').strip()

        if not email:
            return Response({"error": "Email field is required."}, status=status.HTTP_400_BAD_REQUEST)

        if not new_password:
            return Response({"error": "New password field is required."}, status=status.HTTP_400_BAD_REQUEST)

        if len(new_password) < 8:
            return Response({"error": "Password must be at least 8 characters long."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "No user found with this email."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": f"Server error while fetching user: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        try:
            user.password = make_password(new_password)
            user.save()
            return Response({"message": "Password reset successful."}, status=status.HTTP_200_OK)
        except ValidationError as ve:
            return Response({"error": f"Password validation error: {ve.message}"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": f"Server error while resetting password: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)