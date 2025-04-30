from django.urls import path
from .views import (
    CheckPhoneNumberView, CheckUsernameEmailView, DeleteEmergencyContactView, FollowedUsersListAPIView, GetEmergencyContactView, GetUserPreferenceView, RegisterUserView, ResendOTPView, ResetPasswordAfterOTPView, VerifyOTPView, LoginUserView,
    ForgotPasswordView, ResetPasswordView,
    GetProfileView, UpdateUserProfileView,
    CreatePreferenceView, UpdateUserPreferenceView,
    CreateEmergencyContactView, UpdateEmergencyContactView,
    PublicUserProfileView, UserListView,
    FollowToggleView, FollowStatusView,
    GoogleLoginView,
)

urlpatterns = [
    #  Authentication
    path('register/', RegisterUserView.as_view(), name='register_user'),
    path('verify-otp/', VerifyOTPView.as_view(), name='verify_otp'),
    path('login/', LoginUserView.as_view(), name='login_user'),
    path('google-login/', GoogleLoginView.as_view(), name='google_login'),

    #  Password Reset & Email Change
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot_password'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset_password'),
    path('resend-otp/', ResendOTPView.as_view(), name='resend-otp'),
    path('reset-password-after-otp/', ResetPasswordAfterOTPView.as_view(), name='reset-password-after-otp'),

    #  Profile
    path('profile/', GetProfileView.as_view(), name='get_profile'),
    path('update-profile/', UpdateUserProfileView.as_view(), name='update_profile'),

    #  Preferences & Emergency
    path('preferences/', GetUserPreferenceView.as_view(), name='get-preferences'),
    path('create-preference/', CreatePreferenceView.as_view(), name='create_preference'),
    path('update-preference/', UpdateUserPreferenceView.as_view(), name='update_preference'),
    path('create-emergency-contact/', CreateEmergencyContactView.as_view(), name='create_emergency_contact'),
    path('update-emergency-contact/', UpdateEmergencyContactView.as_view(), name='update_emergency_contact'),
    path('emergency-contact/', GetEmergencyContactView.as_view(), name='get_emergency_contact'),
    path('delete-emergency-contact/', DeleteEmergencyContactView.as_view(), name='delete_emergency_contact'),

    #  Public & Follow System
    path('profile/<str:username>/', PublicUserProfileView.as_view(), name='public_profile'),
    path('list/', UserListView.as_view(), name='user_list'),
    path('follow-toggle/', FollowToggleView.as_view(), name='follow_toggle'),
    path('follow-status/', FollowStatusView.as_view(), name='follow_status'),
    path('followed-users/', FollowedUsersListAPIView.as_view(), name='follow_status'),

    
    path('check-username-email/', CheckUsernameEmailView.as_view(), name='check-username-email'),
    path('check-phone-number/', CheckPhoneNumberView.as_view(), name='check-phone-number'),
]



