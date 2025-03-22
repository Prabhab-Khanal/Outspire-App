from django.urls import path
from .views import (
    RegisterUserView, LoginUserView, GoogleLoginView,
    GenerateOTPView, VerifyOTPView, ResetPasswordView,
    UpdateProfileView, DeactivateAccountView, LogoutUserView
)

urlpatterns = [
    # Authentication
    path('register/', RegisterUserView.as_view(), name='register'),
    path('login/', LoginUserView.as_view(), name='login'),
    path('google-login/', GoogleLoginView.as_view(), name='google_login'),
    path('logout/',LogoutUserView.as_view(), name='logout'),

    # OTP
    path('generate-otp/', GenerateOTPView.as_view(), name='generate_otp'),
    path('verify-otp/', VerifyOTPView.as_view(), name='verify_otp'),

    # Password Reset
    path('reset-password/', ResetPasswordView.as_view(), name='reset_password'),

    # Profile Management
    path('update-profile/', UpdateProfileView.as_view(), name='update_profile'),
    path('deactivate-account/', DeactivateAccountView.as_view(), name='deactivate_account'),
]
