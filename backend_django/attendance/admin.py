from django.contrib import admin
from .models import Device, AttendanceRecord

@admin.register(Device)
class DeviceAdmin(admin.ModelAdmin):
    list_display = ('name', 'ip_address', 'port', 'location', 'status')
    list_filter = ('status', 'location')
    search_fields = ('name', 'device_serial', 'ip_address')

@admin.register(AttendanceRecord)
class AttendanceRecordAdmin(admin.ModelAdmin):
    list_display = ('user', 'timestamp', 'type', 'status', 'device')
    list_filter = ('type', 'status', 'device', 'timestamp')
    search_fields = ('user__username',)
    date_hierarchy = 'timestamp'
