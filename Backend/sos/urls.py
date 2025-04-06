from django.urls import path
from .views import (
    EmergencyContactListCreateView,
    EmergencyContactDeleteView,
    SOSAlertCreateView,
    SOSAlertListView,
)

urlpatterns = [
    # Emergency Contacts
    path('emergency-contacts/', EmergencyContactListCreateView.as_view(), name='emergency-contact-list-create'),
    path('emergency-contacts/<int:pk>/', EmergencyContactDeleteView.as_view(), name='emergency-contact-delete'),

    # SOS Alerts
    path('send/', SOSAlertCreateView.as_view(), name='sos-send'),
    path('alerts/', SOSAlertListView.as_view(), name='sos-alerts'),
]
