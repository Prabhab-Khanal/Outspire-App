from django.urls import path
from .views import (
    GenerateOTPForEmailVerificationView, RegisterUserView, VerifyOTPView, LoginUserView, 
    CreateProfileView, UpdateProfileView, 
    CreatePreferenceView, UpdatePreferenceView, 
    CreateEmergencyContactView, ForgotPasswordView, ResetPasswordView, GoogleLoginView, UpdateEmergencyContactView
)

urlpatterns = [
    path('register/', RegisterUserView.as_view(), name='register_user'),
    path('verify-otp/', VerifyOTPView.as_view(), name='verify_otp'),
    path('login/', LoginUserView.as_view(), name='login_user'),
    path('create-profile/', CreateProfileView.as_view(), name='create_profile'),
    path('update-profile/', UpdateProfileView.as_view(), name='update_profile'),
    path('create-preference/', CreatePreferenceView.as_view(), name='create_preference'),
    path('update-preference/', UpdatePreferenceView.as_view(), name='update_preference'),
    path('create-emergency-contact/', CreateEmergencyContactView.as_view(), name='emergency_contact'),
    path('update-emergency-contact/', UpdateEmergencyContactView.as_view(), name='emergency_contact'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot_password'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset_password'),
    path('google-login/', GoogleLoginView.as_view(), name='google_login'),
    path('generate-otp-for-email-verification/', GenerateOTPForEmailVerificationView.as_view(), name='generate_otp_for_email_verification'),

]
