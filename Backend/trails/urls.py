from django.urls import path
from .views import (
    TrailCreateView,
    TrailListView,
    TrailDetailView,
    WaypointCreateView,
    OfflineMapUploadView,
    TrailReviewCreateView
)

urlpatterns = [
    path('create/', TrailCreateView.as_view(), name='trail-create'),
    path('', TrailListView.as_view(), name='trail-list'),
    path('<int:id>/', TrailDetailView.as_view(), name='trail-detail'),
    path('<int:trail_id>/waypoints/', WaypointCreateView.as_view(), name='waypoint-create'),
    path('<int:trail_id>/offline-map/', OfflineMapUploadView.as_view(), name='offline-map-upload'),
    path('<int:trail_id>/reviews/', TrailReviewCreateView.as_view(), name='trail-review-create'),
]
