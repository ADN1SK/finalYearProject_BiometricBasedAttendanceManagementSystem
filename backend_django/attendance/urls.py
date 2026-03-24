from django.urls import path
from . import views

app_name = 'attendance'

urlpatterns = [
    path('mark/', views.mark_attendance, name='mark_attendance'),
    path('reload-embeddings/', views.reload_embeddings, name='reload_embeddings'),
    path('my-history/', views.get_my_attendance_history, name='get_my_attendance_history'),
    path('dashboard-stats/', views.api_dashboard_stats, name='api_dashboard_stats'),
    path('all/', views.api_list_all_attendance, name='api_list_all_attendance'),
]
