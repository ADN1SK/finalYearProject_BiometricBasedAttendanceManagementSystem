from django.urls import path
from . import views

app_name = 'accounts'

urlpatterns = [
    # API Auth
    path('api/csrf/', views.get_csrf, name='get_csrf'),
    path('api/login/', views.api_login, name='api_login'),
    path('api/logout/', views.api_logout, name='api_logout'),
    
    # Biometrics
    path('user/<uuid:user_id>/capture/', views.capture_face, name='capture_face'),
    path('face/check/', views.check_face, name='face_check'),
]
