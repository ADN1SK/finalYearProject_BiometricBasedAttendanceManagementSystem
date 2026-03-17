from django.contrib import admin
from .models import Shift, Assignment

@admin.register(Shift)
class ShiftAdmin(admin.ModelAdmin):
    list_display = ('name', 'department', 'start_time', 'end_time')
    list_filter = ('department',)
    search_fields = ('name',)

@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    list_display = ('user', 'shift', 'from_date', 'to_date', 'assigned_by')
    list_filter = ('shift', 'from_date')
    search_fields = ('user__username',)
    date_hierarchy = 'from_date'
