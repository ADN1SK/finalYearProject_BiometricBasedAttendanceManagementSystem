from django.contrib.auth.decorators import user_passes_test
from django.core.exceptions import PermissionDenied

def hr_officer_required(view_func):
    """
    Decorator for views that checks that the user is an HR Officer or an Administrator.
    """
    def check_user(user):
        if user.is_authenticated and (user.is_hr_officer or user.is_administrator):
            return True
        raise PermissionDenied
    
    return user_passes_test(check_user)(view_func)