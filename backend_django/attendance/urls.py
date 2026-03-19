from django.urls import path
from . import views

app_name = 'attendance'

urlpatterns = [
    path('mark/', views.mark_attendance, name='mark_attendance'),
    path('reload-embeddings/', views.reload_embeddings, name='reload_embeddings'),
    path('my-history/', views.get_my_attendance_history, name='get_my_attendance_history'),
    path('my-stats/', views.get_my_attendance_stats, name='get_my_attendance_stats'),
]
