from django.urls import path
from . import views

app_name = 'reporting'

urlpatterns = [
    # GET to generate an attendance report
    # Example: /api/reporting/attendance/?start_date=2023-01-01&end_date=2023-01-31
    path('attendance/', views.attendance_report, name='attendance_report'),
    path('my-notifications/', views.get_my_notifications, name='get_my_notifications'),
    path('audit-logs/', views.get_audit_logs, name='get_audit_logs'),
    path('system-health/', views.get_system_health, name='get_system_health'),
    path('sync-biometrics/', views.sync_biometrics, name='sync_biometrics'),
    path('sanitize-logs/', views.sanitize_logs, name='sanitize_logs'),
    path('system-operation/<str:op_name>/', views.system_operation, name='system_operation'),
]
