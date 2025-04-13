from django.urls import path
from .views import (

    SOSAlertCreateView,
    SOSAlertListView,
)

urlpatterns = [
    # Emergency Contacts

    # SOS Alerts
    path('send/', SOSAlertCreateView.as_view(), name='sos-send'),
    path('alerts/', SOSAlertListView.as_view(), name='sos-alerts'),
]
