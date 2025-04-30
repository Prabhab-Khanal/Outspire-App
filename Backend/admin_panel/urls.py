from django.urls import path
from .views import (
    AdminBanUserView, AdminCreateTrailView, AdminDeletePostView, AdminDeleteTrailView, AdminListTrailsView, AdminLoginView, AdminPaymentListView, AdminPostDetailView, AdminPostListView, AdminToggleBanUserView, AdminToggleHidePostView, AdminToggleTrailApprovalView, AdminTrailDetailView, AdminUserListView, AdminUpdateEmailVerifiedView,
    AdminApproveTrailView, AdminDashboardStatsView, AdminSendNotificationView, public_sos_list, 
)

urlpatterns = [
    path('login/', AdminLoginView.as_view(), name='admin-login'),
    path('users/', AdminUserListView.as_view(), name='admin-user-list'),
    path('users/<int:user_id>/update-email-verified/', AdminUpdateEmailVerifiedView.as_view(), name='admin-update-email-verified'),
    path('trails/<int:trail_id>/approve/', AdminApproveTrailView.as_view(), name='admin-approve-trail'),
    path('dashboard-stats/', AdminDashboardStatsView.as_view(), name='admin-dashboard-stats'),
    path('notifications/send/', AdminSendNotificationView.as_view(), name='admin-send-notification'),
    path('payments/', AdminPaymentListView.as_view(), name='admin-payment-list'),
    path('trails/', AdminListTrailsView.as_view(), name='admin-list-trails'),
    path('trails/<int:trail_id>/', AdminTrailDetailView.as_view(), name='admin-trail-detail'),
    path('trails/<int:trail_id>/toggle-approval/', AdminToggleTrailApprovalView.as_view(), name='admin-toggle-trail'),
    path('trails/<int:trail_id>/delete/', AdminDeleteTrailView.as_view(), name='admin-delete-trail'),
    path('trails/create/', AdminCreateTrailView.as_view(), name='admin-create-trail'),
    path('users/<int:user_id>/ban/', AdminBanUserView.as_view(), name='admin-ban-user'),
    path('users/<int:user_id>/toggle-ban/', AdminToggleBanUserView.as_view(), name='admin-toggle-ban-user'),
    path('posts/', AdminPostListView.as_view(), name='admin-post-list'),
    path('posts/<int:post_id>/hide/', AdminToggleHidePostView.as_view(), name='admin-hide-post'),
    path('posts/<int:post_id>/delete/', AdminDeletePostView.as_view(), name='admin-delete-post'),
    path('posts/<int:post_id>/detail/', AdminPostDetailView.as_view()),
    path('sos-list/', public_sos_list, name='admin-sos-list'),


]
