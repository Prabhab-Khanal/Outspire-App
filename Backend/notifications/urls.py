from django.urls import path
from .views import SavePushTokenView, ListNotificationsView

urlpatterns = [
    path('save-push-token/', SavePushTokenView.as_view(), name='save-push-token'),
    path('notifications/', ListNotificationsView.as_view(), name='list-notifications'),
]
