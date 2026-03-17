import uuid
from django.contrib.auth.models import AbstractUser, UserManager
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
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, db_column='_id')
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

# 1. Users Table
class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, db_column='_id')
    # username, email, password, first_name, last_name are inherited from AbstractUser
    
    class Status(models.TextChoices):
        ACTIVE = 'ACTIVE', 'Active'
        SUSPENDED = 'SUSPENDED', 'Suspended'

    status = models.CharField(max_length=50, choices=Status.choices, default=Status.ACTIVE)
    roles = models.ManyToManyField(Role, through='UserRole', related_name='users')
    
    # This is the corrected line. We must use the UserManager to get all
    # the necessary methods for authentication.
    objects = UserManager()

    def __str__(self):
        return self.username

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
    # Storing the embedding array as a JSONField is best practice for this use case.
    template_data = models.JSONField(db_column='templateData')

    def __str__(self):
        return f"{self.type} template for {self.user.username}"
