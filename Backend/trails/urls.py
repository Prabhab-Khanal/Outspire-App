from django.urls import path
from . import views

urlpatterns = [
    path('add/', views.AddTrailView.as_view(), name='add_trail'),
    path('update/<int:trail_id>/', views.UpdateTrailView.as_view(), name='update_trail'),
    path('delete/<int:trail_id>/', views.DeleteTrailView.as_view(), name='delete_trail'),
    path('all-trails/', views.ListTrailsView.as_view(), name='list_trails'),
    path('retrieve-trails/<int:trail_id>/', views.RetrieveTrailView.as_view(), name='retrieve_trail'),
]
