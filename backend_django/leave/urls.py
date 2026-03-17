from django.urls import path
from . import views

app_name = 'leave'

urlpatterns = [
    # --- Employee URLs ---
    # POST to submit a leave request
    path('submit/', views.submit_leave_request, name='submit_leave'),
    # GET to view own leave requests
    path('my-requests/', views.view_my_leave_requests, name='view_my_leave_requests'),

    # --- HR Officer URLs ---
    # GET to list all leave requests (e.g., /api/leave/manage/all?status=PENDING)
    path('manage/all/', views.list_all_leave_requests, name='list_all_leave_requests'),
    # GET to view a specific request, PUT to approve/reject
    path('manage/<uuid:request_id>/', views.manage_leave_request, name='manage_leave_request'),
]
