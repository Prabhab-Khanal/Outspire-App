from django.urls import path
from .views import (
    RegisterUserView, LoginUserView, LogoutUserView,
    GoogleLoginView, GenerateOTPView, VerifyOTPView,
    ResetPasswordView, CreateProfileView, UpdateProfileView,
    CreatePreferenceView, UpdatePreferenceView, UserDashboardView
)

urlpatterns = [
    # Auth + OTP
    path('register/', RegisterUserView.as_view(), name='register'),
    path('login/', LoginUserView.as_view(), name='login'),
    path('logout/', LogoutUserView.as_view(), name='logout'),
    path('google-login/', GoogleLoginView.as_view(), name='google-login'),
    path('otp/generate/', GenerateOTPView.as_view(), name='generate-otp'),
    path('otp/verify/', VerifyOTPView.as_view(), name='verify-otp'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset-password'),

    # Profile
    path('profile/create/', CreateProfileView.as_view(), name='create-profile'),
    path('profile/update/', UpdateProfileView.as_view(), name='update-profile'),

    # Preferences
    path('preference/create/', CreatePreferenceView.as_view(), name='create-preference'),
    path('preference/update/', UpdatePreferenceView.as_view(), name='update-preference'),

    # Dashboard
    path('dashboard/', UserDashboardView.as_view(), name='user-dashboard'),
]
