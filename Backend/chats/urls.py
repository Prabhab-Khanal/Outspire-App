from django.urls import path
from .views import (
    AddMembersToGroupView, ChatUsersView, LeaveGroupView, ListGroupMembersView, ListUserGroupsView, RenameGroupView, SendMessageView, FetchMessagesView,
    CreateGroupView, JoinGroupView, SendGroupMessageView, FetchGroupMessagesView
)

urlpatterns = [
    # Private chats
    path('send/', SendMessageView.as_view(), name='send-message'),
    path('fetch/', FetchMessagesView.as_view(), name='fetch-messages'),
    path('group/list/', ListUserGroupsView.as_view(), name='group-list'),
    # Group chats
    path('group/create/', CreateGroupView.as_view(), name='create-group'),
    path('group/join/', JoinGroupView.as_view(), name='join-group'),
    path('group/send/', SendGroupMessageView.as_view(), name='send-group-message'),
    path('group/fetch/<int:group_id>/', FetchGroupMessagesView.as_view(), name='fetch-group-messages'),
    path('group/add-members/', AddMembersToGroupView.as_view(), name='group-add-members'),
    path('group/rename/', RenameGroupView.as_view(), name='group-rename'),
    path('group/members/<int:group_id>/', ListGroupMembersView.as_view(), name='group-members'),

    path('chat-users/', ChatUsersView.as_view(), name='chat-users'),
    path('leave-group/<int:group_id>/', LeaveGroupView.as_view(), name='leave-group')
]
