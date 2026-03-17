from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.urls import reverse
from django.utils.html import format_html
from .models import User, EmployeeDetail, Department, Role, BiometricTemplate

# Unregister the default Group model if not needed, as we have a custom Role model
# from django.contrib.auth.models import Group
# admin.site.unregister(Group)

class EmployeeDetailInline(admin.StackedInline):
    """
    Makes the EmployeeDetail profile editable directly from the User page.
    """
    model = EmployeeDetail
    can_delete = False
    verbose_name_plural = 'Employee Details'
    fk_name = 'user'
    fields = ('department', 'position', 'employment_type', 'hire_date', 'biometric_enrolled_status')
    readonly_fields = ('biometric_enrolled_status',)

    def biometric_enrolled_status(self, instance):
        # Check if a face template exists for this user
        if hasattr(instance, 'user'):
            return "Yes" if BiometricTemplate.objects.filter(user=instance.user, type=BiometricTemplate.BiometricType.FACE).exists() else "No"
        return "No"
    biometric_enrolled_status.short_description = 'Biometric Enrolled'

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """
    Custom User admin configuration.
    """
    inlines = (EmployeeDetailInline,)
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'status')
    list_filter = ('status', 'is_staff', 'is_superuser', 'groups')
    fieldsets = BaseUserAdmin.fieldsets + (
        ('User Status', {'fields': ('status',)}),
    )

@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'manager')

@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')

@admin.register(EmployeeDetail)
class EmployeeDetailAdmin(admin.ModelAdmin):
    """
    Admin configuration for EmployeeDetail, customized for face enrollment.
    """
    list_display = ('user', 'department', 'position', 'hire_date', 'biometric_enrolled')
    readonly_fields = ('biometric_enrolled_status', 'face_enrollment_link')
    fieldsets = (
        ('Employee Info', {
            'fields': ('user', 'department', 'position', 'employment_type', 'hire_date')
        }),
        ('Biometrics', {
            'fields': ('biometric_enrolled_status', 'face_enrollment_link')
        }),
    )

    def biometric_enrolled_status(self, obj):
        enrolled = BiometricTemplate.objects.filter(user=obj.user, type=BiometricTemplate.BiometricType.FACE).exists()
        # This ensures the boolean field in the model is also up-to-date
        if obj.biometric_enrolled != enrolled:
            obj.biometric_enrolled = enrolled
            obj.save(update_fields=['biometric_enrolled'])
        return "Yes" if enrolled else "No"
    biometric_enrolled_status.short_description = 'Status'

    def face_enrollment_link(self, obj):
        """
        A button that links to the face capture page for this employee.
        """
        if obj.user_id:
            # This is the corrected, functional code
            url = reverse('accounts:capture_face', args=[obj.user_id])
            return format_html('<a class="button" href="{}">Capture / Re-capture Face</a>', url)
        return "Save employee first to enable face capture."
    face_enrollment_link.short_description = 'Actions'

@admin.register(BiometricTemplate)
class BiometricTemplateAdmin(admin.ModelAdmin):
    list_display = ('user', 'type')
    readonly_fields = ('template_data',)
