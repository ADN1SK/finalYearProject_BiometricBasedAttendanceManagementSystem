import uuid
from django.db import models
from accounts.models import User, Department

# 6. Policies Table
class Policy(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, db_column='_id')
    name = models.CharField(max_length=255)
    rules = models.JSONField()
    department = models.ForeignKey(Department, on_delete=models.CASCADE, null=True, blank=True, db_column='departmentId')

    def __str__(self):
        return self.name

# 5. Leave Requests Table
class LeaveRequest(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, db_column='_id')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='leave_requests', db_column='userId')
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_leaves', db_column='approvedBy')
    applied_policy = models.ForeignKey(Policy, on_delete=models.SET_NULL, null=True, blank=True, db_column='appliedPolicyId')
    
    class LeaveType(models.TextChoices):
        SICK_LEAVE = 'SICK_LEAVE', 'Sick Leave'
        ANNUAL_LEAVE = 'ANNUAL_LEAVE', 'Annual Leave'
        UNPAID_LEAVE = 'UNPAID_LEAVE', 'Unpaid Leave'
        OTHER = 'OTHER', 'Other'
        
    leave_type = models.CharField(max_length=50, choices=LeaveType.choices, db_column='leaveType')
    start_date = models.DateField(db_column='startDate')
    end_date = models.DateField(db_column='endDate')
    
    class LeaveStatus(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        APPROVED = 'APPROVED', 'Approved'
        REJECTED = 'REJECTED', 'Rejected'
        
    status = models.CharField(max_length=50, choices=LeaveStatus.choices, default=LeaveStatus.PENDING)

    def __str__(self):
        return f"Leave for {self.user.username} from {self.start_date} to {self.end_date}"
