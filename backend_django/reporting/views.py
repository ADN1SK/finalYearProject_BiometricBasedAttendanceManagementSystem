from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from attendance.models import AttendanceRecord, Device
from accounts.models import User, Role
from datetime import datetime, timedelta
from django.db.models import F, ExpressionWrapper, fields
from django.contrib.auth.decorators import login_required
from .models import Notification, AuditLog
from django.db import connection
from django.utils import timezone
from django.conf import settings
import subprocess
import os
import json

# --- Telemetry Tracker ---
SERVER_START_TIME = timezone.now()

def format_uptime(delta):
    days = delta.days
    hours, remainder = divmod(delta.seconds, 3600)
    minutes, seconds = divmod(remainder, 60)
    if days > 0:
        return f"{days}d {hours}h {minutes}m"
    elif hours > 0:
        return f"{hours}h {minutes}m"
    else:
        return f"{minutes}m {seconds}s"

# --- Permission Helpers (Should be moved to a central utility module) ---

def get_user_from_request(request):
    if request.user.is_authenticated:
        return request.user
    return None

def is_hr_officer(user):
    try:
        hr_role = Role.objects.get(name='HR_OFFICER')
        return user.roles.filter(id=hr_role.id).exists()
    except Role.DoesNotExist:
        return False

# --- Reporting Views ---

@csrf_exempt
def attendance_report(request):
    user = get_user_from_request(request)
    if not user or not is_hr_officer(user):
        return JsonResponse({'error': 'Permission denied'}, status=403)

    if request.method != 'GET':
        return JsonResponse({'error': 'Invalid request method'}, status=405)

    try:
        # --- Get Query Parameters ---
        start_date_str = request.GET.get('start_date')
        end_date_str = request.GET.get('end_date')
        employee_id = request.GET.get('user_id')

        if not start_date_str or not end_date_str:
            return JsonResponse({'error': 'start_date and end_date parameters are required.'}, status=400)

        start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
        end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()

        # --- Filter Records ---
        records = AttendanceRecord.objects.filter(
            timestamp__date__range=[start_date, end_date]
        ).select_related('user').order_by('user__username', 'timestamp')

        if employee_id:
            records = records.filter(user__id=employee_id)

        # --- Process Data ---
        report_data = {}
        for record in records:
            user_id = str(record.user.id)
            day = record.timestamp.date().isoformat()

            if user_id not in report_data:
                report_data[user_id] = {
                    'username': record.user.username,
                    'full_name': record.user.get_full_name(),
                    'summary': {
                        'total_days_present': 0,
                        'late_arrivals': 0,
                        'early_exits': 0,
                        'total_work_hours': 0.0,
                    },
                    'daily_records': {}
                }

            if day not in report_data[user_id]['daily_records']:
                report_data[user_id]['daily_records'][day] = {}

            if record.type == AttendanceRecord.RecordType.CHECK_IN:
                report_data[user_id]['daily_records'][day]['check_in'] = record.timestamp.isoformat()
                if record.status == AttendanceRecord.RecordStatus.LATE:
                    report_data[user_id]['summary']['late_arrivals'] += 1
            
            elif record.type == AttendanceRecord.RecordType.CHECK_OUT:
                report_data[user_id]['daily_records'][day]['check_out'] = record.timestamp.isoformat()
                if record.status == AttendanceRecord.RecordStatus.EARLY_EXIT:
                    report_data[user_id]['summary']['early_exits'] += 1

        # --- Calculate Summaries ---
        for user_id, data in report_data.items():
            present_days = set()
            total_duration = timedelta()

            for day, daily_data in data['daily_records'].items():
                if 'check_in' in daily_data:
                    present_days.add(day)
                
                if 'check_in' in daily_data and 'check_out' in daily_data:
                    check_in_time = datetime.fromisoformat(daily_data['check_in'])
                    check_out_time = datetime.fromisoformat(daily_data['check_out'])
                    duration = check_out_time - check_in_time
                    total_duration += duration
            
            data['summary']['total_days_present'] = len(present_days)
            data['summary']['total_work_hours'] = round(total_duration.total_seconds() / 3600, 2)
            if len(present_days) > 0:
                data['summary']['average_work_hours'] = round(data['summary']['total_work_hours'] / len(present_days), 2)
            else:
                data['summary']['average_work_hours'] = 0.0


        return JsonResponse({'success': True, 'report': list(report_data.values())})

    except ValueError:
        return JsonResponse({'error': 'Invalid date format. Please use YYYY-MM-DD.'}, status=400)
    except Exception as e:
        return JsonResponse({'error': f'An unexpected error occurred: {str(e)}'}, status=500)


@login_required
def get_my_notifications(request):
    """
    Returns the latest 10 notifications for the current user.
    """
    try:
        notifications = Notification.objects.filter(user=request.user).order_by('-sent_at')[:10]
        data = []
        for n in notifications:
            data.append({
                'id': str(n.id),
                'type': n.type,
                'message': n.message,
                'status': n.status,
                'sent_at': n.sent_at.isoformat(),
                'time_ago': n.sent_at.strftime('%b %d, %H:%M')
            })
        return JsonResponse({'success': True, 'notifications': data})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)
@csrf_exempt
def get_audit_logs(request):
    user = get_user_from_request(request)
    if not user or not user.is_superuser: # Only superusers for audit for now
        return JsonResponse({'error': 'Permission denied'}, status=403)

    try:
        logs = AuditLog.objects.all().select_related('user').order_by('-timestamp')[:100]
        data = [{
            'id': str(log.id),
            'user': log.user.username if log.user else 'System',
            'action': log.action,
            'description': log.description,
            'timestamp': log.timestamp.isoformat(),
            'ip_address': log.ip_address
        } for log in logs]
        return JsonResponse({'success': True, 'logs': data})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
@csrf_exempt
def sync_biometrics(request):
    """Triggers a reload of facial embeddings from the database."""
    if not request.user.is_authenticated or not request.user.is_superuser:
        return JsonResponse({'error': 'Permission denied'}, status=403)
    
    from attendance.views import load_known_embeddings
    try:
        load_known_embeddings()
        return JsonResponse({'success': True, 'message': 'Biometric embeddings synchronized successfully.'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)

@csrf_exempt
def sanitize_logs(request):
    """Deletes audit logs older than 90 days."""
    if not request.user.is_authenticated or not request.user.is_superuser:
        return JsonResponse({'error': 'Permission denied'}, status=403)
    
    try:
        ninety_days_ago = timezone.now() - timedelta(days=90)
        count = AuditLog.objects.filter(timestamp__lt=ninety_days_ago).delete()[0]
        return JsonResponse({'success': True, 'message': f'Sanitized {count} old log entries.'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)

@csrf_exempt
def system_operation(request, op_name):
    """Generic handler for maintenance and backup operations."""
    if not request.user.is_authenticated or not request.user.is_superuser:
        return JsonResponse({'error': 'Permission denied'}, status=403)
    
    try:
        if op_name == 'db_maintenance':
            # Django's autocommit must be temporarily forced to true to execute transaction-less VACUUM commands natively without OS sub-processes.
            old_autocommit = connection.autocommit
            connection.set_autocommit(True)
            try:
                with connection.cursor() as cursor:
                    cursor.execute("VACUUM ANALYZE;")
            finally:
                connection.set_autocommit(old_autocommit)
                
            return JsonResponse({'success': True, 'message': 'Database maintenance (VACUUM ANALYZE) completed successfully. Dead tuples cleared and indexes optimized.'})
            
        elif op_name == 'system_backup':
            # Create secure backend backups directory dynamically
            backups_dir = os.path.join(settings.BASE_DIR, 'backups')
            os.makedirs(backups_dir, exist_ok=True)
            
            # Generate deterministic filename
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"bbeams_backup_{timestamp}.sql"
            filepath = os.path.join(backups_dir, filename)
            
            # Read Django database configurations securely
            db_config = settings.DATABASES['default']
            db_name = db_config.get('NAME')
            db_user = db_config.get('USER')
            db_host = db_config.get('HOST', 'localhost')
            db_port = str(db_config.get('PORT', '5432'))
            db_password = db_config.get('PASSWORD', '')
            
            # Environment var injection for secure pg_dump execution (passwordless UI prompt)
            env = os.environ.copy()
            if db_password:
                env['PGPASSWORD'] = db_password
                
            import shutil
            import platform
            
            # Detect pg_dump binary
            pg_dump_path = shutil.which('pg_dump')
            if not pg_dump_path:
                if platform.system() == 'Windows':
                    # Check common local PostgreSQL installation paths for the user
                    for version in ['18', '17', '16', '15', '14']:
                        cp = rf"C:\Program Files\PostgreSQL\{version}\bin\pg_dump.exe"
                        if os.path.exists(cp):
                            pg_dump_path = cp
                            break
            
            if not pg_dump_path:
                return JsonResponse({
                    'success': False,
                    'error': 'The pg_dump utility was not found. Please ensure PostgreSQL bin/ is in your server PATH variables.'
                }, status=500)
                
            dump_cmd = [
                pg_dump_path,
                '-h', db_host,
                '-p', db_port,
                '-U', db_user,
                '-d', db_name,
                '-F', 'c',  # Custom compressed format for Postgres
                '-f', filepath
            ]
            
            result = subprocess.run(dump_cmd, env=env, capture_output=True, text=True)
            
            if result.returncode == 0:
                return JsonResponse({
                    'success': True, 
                    'message': f'System backup completed successfully and saved securely as {filename}.'
                })
            else:
                return JsonResponse({
                    'success': False, 
                    'error': f'Database Dump failed. Ensure pg_dump is in your system PATH. Trace: {result.stderr}'
                }, status=500)
                
        else:
            return JsonResponse({'success': False, 'error': f'Operational hook "{op_name}" not mapped.'}, status=400)
            
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)

@csrf_exempt
def get_system_health(request):
    """Returns real-time system health metrics."""
    if not request.user.is_authenticated or (not request.user.is_superuser and not is_hr_officer(request.user)):
        return JsonResponse({'error': 'Permission denied'}, status=403)
    
    try:
        # Check database connectivity
        connection.ensure_connection()
        db_status = 'OPTIMAL'
    except Exception:
        db_status = 'ERROR'

    active_terminals = Device.objects.filter(status='active').count()
    uptime_delta = timezone.now() - SERVER_START_TIME
    
    data = {
        'success': True,
        'health': {
            'db_status': db_status,
            'active_terminals': f'{active_terminals:02d} ACTIVE',
            'uptime': format_uptime(uptime_delta),
            'last_sync': timezone.now().isoformat()
        }
    }
    return JsonResponse(data)


# =====================================
# GLOBAL SYSTEM CONFIGURATION
# =====================================

CONFIG_FILE_PATH = os.path.join(settings.BASE_DIR, 'global_config.json')

DEFAULT_CONFIG = {
    'session_timeout_minutes': 60,
    'strict_mode': False,
    'max_login_attempts': 3
}

def _read_config():
    if not os.path.exists(CONFIG_FILE_PATH):
        with open(CONFIG_FILE_PATH, 'w') as f:
            json.dump(DEFAULT_CONFIG, f, indent=4)
        return DEFAULT_CONFIG
    try:
        with open(CONFIG_FILE_PATH, 'r') as f:
            return json.load(f)
    except Exception:
        return DEFAULT_CONFIG

@login_required
def get_global_config(request):
    """Retrieves the system-wide global configuration settings."""
    if not request.user.is_superuser and not is_hr_officer(request.user):
        return JsonResponse({'error': 'Permission denied'}, status=403)
    return JsonResponse({'success': True, 'config': _read_config()})

@csrf_exempt
def update_global_config(request):
    """Saves system-wide configurations securely to the JSON engine store."""
    if not request.user.is_authenticated or not request.user.is_superuser:
        return JsonResponse({'error': 'Permission denied'}, status=403)
    
    if request.method != 'POST':
        return JsonResponse({'error': 'POST required'}, status=405)
        
    try:
        data = json.loads(request.body)
        current_config = _read_config()
        
        # Merge updates safely
        if 'session_timeout_minutes' in data:
            current_config['session_timeout_minutes'] = int(data['session_timeout_minutes'])
        if 'strict_mode' in data:
            current_config['strict_mode'] = bool(data['strict_mode'])
        if 'max_login_attempts' in data:
            current_config['max_login_attempts'] = int(data['max_login_attempts'])
            
        with open(CONFIG_FILE_PATH, 'w') as f:
            json.dump(current_config, f, indent=4)
            
        return JsonResponse({'success': True, 'message': 'Global configuration applied successfully.'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)
