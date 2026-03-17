from django.contrib import admin
from .models import Policy, LeaveRequest

@admin.register(Policy)
class PolicyAdmin(admin.ModelAdmin):
    list_display = ('name', 'department')
    list_filter = ('department',)
    search_fields = ('name',)

@admin.register(LeaveRequest)
class LeaveRequestAdmin(admin.ModelAdmin):
    list_display = ('user', 'leave_type', 'start_date', 'end_date', 'status', 'approved_by')
    list_filter = ('status', 'leave_type', 'start_date')
    search_fields = ('user__username',)
    date_hierarchy = 'start_date'
    
    # Make fields read-only once a request is no longer pending
    def get_readonly_fields(self, request, obj=None):
        if obj and obj.status != 'PENDING':
            return self.readonly_fields + ('user', 'leave_type', 'start_date', 'end_date')
        return self.readonly_fields
