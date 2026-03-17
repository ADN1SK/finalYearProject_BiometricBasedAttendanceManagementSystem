import uuid
from django.db import models
from accounts.models import User, Department

# 10. Shifts Table (Scheduling)
class Shift(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, db_column='_id')
    department = models.ForeignKey(Department, on_delete=models.CASCADE, null=True, blank=True, db_column='departmentId')
    name = models.CharField(max_length=255)
    start_time = models.TimeField(db_column='startTime')
    end_time = models.TimeField(db_column='endTime')

    def __str__(self):
        return f"{self.name} ({self.start_time} - {self.end_time})"

# 11. Assignments Table (Work Schedules)
class Assignment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, db_column='_id')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assignments', db_column='userId')
    shift = models.ForeignKey(Shift, on_delete=models.CASCADE, related_name='assignments', db_column='shiftId')
    from_date = models.DateField(db_column='fromDate')
    to_date = models.DateField(null=True, blank=True, db_column='toDate')
    assigned_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='made_assignments', db_column='assignedBy')

    def __str__(self):
        return f"{self.user.username} assigned to {self.shift.name}"
