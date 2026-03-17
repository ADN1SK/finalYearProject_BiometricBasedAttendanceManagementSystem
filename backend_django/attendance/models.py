import uuid
from django.db import models
from accounts.models import User

# 8. Devices Table (Hardware)
class Device(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, db_column='_id')
    device_serial = models.CharField(max_length=255, unique=True, db_column='device_Serial')
    name = models.CharField(max_length=255)
    ip_address = models.GenericIPAddressField(unique=True, db_column='ipAddress')
    port = models.IntegerField()
    location = models.CharField(max_length=255, blank=True, null=True)
    
    class Status(models.TextChoices):
        ONLINE = 'ONLINE', 'Online'
        OFFLINE = 'OFFLINE', 'Offline'
        MAINTENANCE = 'MAINTENANCE', 'Maintenance'
        
    status = models.CharField(max_length=50, choices=Status.choices, default=Status.OFFLINE)

    def __str__(self):
        return self.name

# 4. Attendance Records Table
class AttendanceRecord(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, db_column='_id')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='attendance_records', db_column='userId')
    device = models.ForeignKey(Device, on_delete=models.SET_NULL, null=True, blank=True, db_column='deviceId')
    timestamp = models.DateTimeField()
    
    class RecordType(models.TextChoices):
        CHECK_IN = 'CHECK_IN', 'Check-in'
        CHECK_OUT = 'CHECK_OUT', 'Check-out'
        
    type = models.CharField(max_length=50, choices=RecordType.choices)
    
    class RecordStatus(models.TextChoices):
        ON_TIME = 'ON_TIME', 'On-time'
        LATE = 'LATE', 'Late'
        EARLY_EXIT = 'EARLY_EXIT', 'Early-exit'
        
    status = models.CharField(max_length=50, choices=RecordStatus.choices)

    def __str__(self):
        return f"{self.user.username} - {self.type} at {self.timestamp}"
