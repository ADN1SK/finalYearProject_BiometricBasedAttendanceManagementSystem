from django.urls import path
from . import views

app_name = 'accounts'

urlpatterns = [
    # API Auth
    path('api/csrf/', views.get_csrf, name='get_csrf'),
    path('api/login/', views.api_login, name='api_login'),
    path('api/logout/', views.api_logout, name='api_logout'),
    path('api/users/', views.api_list_users, name='api_user_list'),
    path('api/users/create/', views.api_create_user, name='api_user_create'),
    path('api/users/<uuid:user_id>/update/', views.api_update_user, name='api_user_update'),
    path('api/departments/', views.api_list_departments, name='api_department_list'),
    
    # Biometrics
    path('user/<uuid:user_id>/capture/', views.capture_face, name='capture_face'),
    path('user/<uuid:user_id>/verify/', views.verify_face, name='verify_face'),
    path('face/check/', views.check_face, name='face_check'),
]
