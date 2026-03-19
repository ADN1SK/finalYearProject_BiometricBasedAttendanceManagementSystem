from django.urls import path
from . import views

app_name = 'reporting'

urlpatterns = [
    # GET to generate an attendance report
    # Example: /api/reporting/attendance/?start_date=2023-01-01&end_date=2023-01-31
    path('attendance/', views.attendance_report, name='attendance_report'),
    path('my-notifications/', views.get_my_notifications, name='get_my_notifications'),
]
