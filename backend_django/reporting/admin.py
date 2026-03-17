from django.contrib import admin
from .models import Report

@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ('type', 'generated_at')
    list_filter = ('type', 'generated_at')
    date_hierarchy = 'generated_at'
