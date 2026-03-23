import uuid
from django.contrib.auth.models import AbstractUser, UserManager, Permission
from django.db import models

# 1. Departments Table
class Department(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, db_column='_id')
    name = models.CharField(max_length=255, unique=True)
    manager = models.ForeignKey('User', on_delete=models.SET_NULL, null=True, blank=True, related_name='managed_department')

    def __str__(self):
        return self.name

# 12. Roles Table
class Role(models.Model):
    ADMINISTRATOR = 'Administrator'
    HR_OFFICER = 'HR Officer'
    EMPLOYEE = 'Employee'
    
    ROLE_CHOICES = (
        (ADMINISTRATOR, 'System administrator with full access'),
        (HR_OFFICER, 'HR officer with access to employee management'),
        (EMPLOYEE, 'Regular employee with limited access'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, db_column='_id')
    name = models.CharField(max_length=100, unique=True, choices=ROLE_CHOICES)
    description = models.TextField(blank=True, null=True)
    permissions = models.ManyToManyField(Permission, related_name='roles')

    def __str__(self):
        return self.get_name_display()

# 1. Users Table
class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, db_column='_id')
    
    class Status(models.TextChoices):
        ACTIVE = 'ACTIVE', 'Active'
        SUSPENDED = 'SUSPENDED', 'Suspended'

    status = models.CharField(max_length=50, choices=Status.choices, default=Status.ACTIVE)
    roles = models.ManyToManyField(Role, through='UserRole', related_name='users')
    must_change_password = models.BooleanField(default=False)
    
    objects = UserManager()

    def save(self, *args, **kwargs):
        # Ensure that is_staff is set correctly based on role
        if self.is_administrator:
            self.is_staff = True
        super().save(*args, **kwargs)

    def __str__(self):
        return self.username

    @property
    def is_administrator(self):
        return self.is_superuser or self.roles.filter(name=Role.ADMINISTRATOR).exists()

    @property
    def is_hr_officer(self):
        return self.roles.filter(name=Role.HR_OFFICER).exists()

    @property
    def is_employee(self):
        return self.roles.filter(name=Role.EMPLOYEE).exists()

# 7. User Roles (Junction Table)
class UserRole(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, db_column='_id')
    user = models.ForeignKey(User, on_delete=models.CASCADE, db_column='userId')
    role = models.ForeignKey(Role, on_delete=models.CASCADE, db_column='roleId')
    assigned_at = models.DateTimeField(auto_now_add=True, db_column='assignedAt')

    class Meta:
        unique_together = ('user', 'role')

# 2. Employee Details Table
class EmployeeDetail(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True, db_column='userId')
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True, db_column='departmentId')
    
    class EmploymentType(models.TextChoices):
        FULL_TIME = 'FULL_TIME', 'Full-time'
        PART_TIME = 'PART_TIME', 'Part-time'
        CONTRACT = 'CONTRACT', 'Contract'

    position = models.CharField(max_length=255, blank=True, null=True)
    employment_type = models.CharField(max_length=50, choices=EmploymentType.choices, null=True, blank=True, db_column='employmentType')
    hire_date = models.DateField(db_column='hireDate')
    biometric_enrolled = models.BooleanField(default=False, db_column='biometricEnrolled')

    def __str__(self):
        return f"Profile of {self.user.username}"

# 9. Biometric Templates Table
class BiometricTemplate(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, db_column='_id')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='biometric_templates', db_column='userId')
    
    class BiometricType(models.TextChoices):
        FACE = 'FACE', 'Face'
        FINGERPRINT = 'FINGERPRINT', 'Fingerprint'

    type = models.CharField(max_length=50, choices=BiometricType.choices)
    template_data = models.JSONField(db_column='templateData')

    def __str__(self):
        return f"{self.type} template for {self.user.username}"

# 18. Workflow Table
class Workflow(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, db_column='_id')
    name = models.CharField(max_length=255)
    steps = models.JSONField(null=True, blank=True)