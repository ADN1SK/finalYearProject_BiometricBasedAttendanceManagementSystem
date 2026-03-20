from django.urls import path
from . import views

app_name = 'attendance'

urlpatterns = [
    path('mark/', views.mark_attendance, name='mark_attendance'),
    path('reload-embeddings/', views.reload_embeddings, name='reload_embeddings'),
    path('my-history/', views.get_my_attendance_history, name='get_my_attendance_history'),
    path('my-stats/', views.get_my_attendance_stats, name='get_my_attendance_stats'),
    path('all/', views.api_list_all_attendance, name='api_list_all_attendance'),
    path('admin-stats/', views.api_admin_stats, name='api_admin_stats'),
    path('hr-stats/', views.api_hr_stats, name='api_hr_stats'),
]
