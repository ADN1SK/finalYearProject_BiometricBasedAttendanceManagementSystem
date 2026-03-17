from django.urls import path
from . import views

app_name = 'accounts'

urlpatterns = [
    path('user/<uuid:user_id>/capture/', views.capture_face, name='capture_face'),
]
