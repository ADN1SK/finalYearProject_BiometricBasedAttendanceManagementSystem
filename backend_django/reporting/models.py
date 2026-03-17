import uuid
from django.db import models

# 16. Report Table
class Report(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, db_column='_id')
    
    class ReportType(models.TextChoices):
        ATTENDANCE = 'ATTENDANCE', 'Attendance'
        PERFORMANCE = 'PERFORMANCE', 'Performance'
        LEAVE = 'LEAVE', 'Leave'
        
    type = models.CharField(max_length=50, choices=ReportType.choices)
    parameters = models.JSONField()
    generated_at = models.DateTimeField(auto_now_add=True, db_column='generatedAt')

    def __str__(self):
        return f"{self.get_type_display()} Report generated at {self.generated_at}"
