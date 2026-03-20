from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from .models import LeaveRequest, Policy
from accounts.models import User, Role
import json
from datetime import datetime

# --- Authentication & Permission Helpers ---

def get_user_from_request(request):
    # Placeholder for a real authentication system (e.g., JWT)
    if request.user.is_authenticated:
        return request.user
    return None

def is_hr_officer(user):
    # Checks if the user has the 'HR_OFFICER' role.
    # Assumes roles are pre-populated in the database.
    try:
        hr_role = Role.objects.get(name='HR_OFFICER')
        return user.roles.filter(id=hr_role.id).exists()
    except Role.DoesNotExist:
        return False

# --- Employee-Facing Views ---

@csrf_exempt
def submit_leave_request(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method'}, status=405)

    user = get_user_from_request(request)
    if not user:
        return JsonResponse({'error': 'Authentication required'}, status=401)

    try:
        data = json.loads(request.body)
        leave_type = data.get('leave_type')
        start_date_str = data.get('start_date')
        end_date_str = data.get('end_date')

        if not all([leave_type, start_date_str, end_date_str]):
            return JsonResponse({'error': 'Missing required fields'}, status=400)

        start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
        end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()

        if start_date > end_date:
            return JsonResponse({'error': 'Start date cannot be after end date'}, status=400)

        leave_request = LeaveRequest.objects.create(
            user=user,
            leave_type=leave_type,
            start_date=start_date,
            end_date=end_date,
            status=LeaveRequest.LeaveStatus.PENDING
        )

        return JsonResponse({
            'success': True,
            'message': 'Leave request submitted successfully.',
            'request_id': leave_request.id
        }, status=201)

    except (json.JSONDecodeError, ValueError):
        return JsonResponse({'error': 'Invalid data format'}, status=400)
    except Exception as e:
        return JsonResponse({'error': f'An unexpected error occurred: {str(e)}'}, status=500)

@csrf_exempt
def view_my_leave_requests(request):
    if request.method != 'GET':
        return JsonResponse({'error': 'Invalid request method'}, status=405)

    user = get_user_from_request(request)
    if not user:
        return JsonResponse({'error': 'Authentication required'}, status=401)

    try:
        requests = LeaveRequest.objects.filter(user=user).order_by('-start_date')
        data = [{
            'id': req.id,
            'leave_type': req.get_leave_type_display(),
            'start_date': req.start_date,
            'end_date': req.end_date,
            'status': req.get_status_display(),
            'approved_by': req.approved_by.username if req.approved_by else None
        } for req in requests]
        return JsonResponse({'success': True, 'leave_requests': data})

    except Exception as e:
        return JsonResponse({'error': f'An unexpected error occurred: {str(e)}'}, status=500)

# --- HR Officer Views ---

@csrf_exempt
def list_all_leave_requests(request):
    if request.method != 'GET':
        return JsonResponse({'error': 'Invalid request method'}, status=405)

    user = get_user_from_request(request)
    if not user or not is_hr_officer(user):
        return JsonResponse({'error': 'Permission denied. HR Officer role required.'}, status=403)

    try:
        # HR can filter by status (e.g., /?status=PENDING)
        status_filter = request.GET.get('status')
        query = LeaveRequest.objects.all()
        if status_filter and status_filter.upper() in LeaveRequest.LeaveStatus.values:
            query = query.filter(status=status_filter.upper())

        requests = query.order_by('start_date').select_related('user')
        data = [{
            'id': req.id,
            'employee_name': req.user.get_full_name() or req.user.username,
            'leave_type': req.get_leave_type_display(),
            'start_date': req.start_date,
            'end_date': req.end_date,
            'status': req.get_status_display(),
        } for req in requests]
        return JsonResponse({'success': True, 'leave_requests': data})

    except Exception as e:
        return JsonResponse({'error': f'An unexpected error occurred: {str(e)}'}, status=500)


@csrf_exempt
def manage_leave_request(request, request_id):
    user = get_user_from_request(request)
    if not user or not is_hr_officer(user):
        return JsonResponse({'error': 'Permission denied. HR Officer role required.'}, status=403)

    try:
        leave_request = LeaveRequest.objects.get(pk=request_id)
    except LeaveRequest.DoesNotExist:
        return JsonResponse({'error': 'Leave request not found'}, status=404)

    if request.method == 'GET':
        data = {
            'id': leave_request.id,
            'employee_name': leave_request.user.get_full_name() or leave_request.user.username,
            'leave_type': leave_request.get_leave_type_display(),
            'start_date': leave_request.start_date,
            'end_date': leave_request.end_date,
            'status': leave_request.get_status_display(),
        }
        return JsonResponse({'success': True, 'leave_request': data})

    if request.method == 'PUT':
        if leave_request.status != LeaveRequest.LeaveStatus.PENDING:
            return JsonResponse({'error': 'This request has already been processed.'}, status=400)
            
        data = json.loads(request.body)
        new_status = data.get('status', '').upper()

        if new_status == LeaveRequest.LeaveStatus.APPROVED:
            leave_request.status = LeaveRequest.LeaveStatus.APPROVED
            leave_request.approved_by = user
            leave_request.save()
            # Here you might trigger a notification to the employee
            return JsonResponse({'success': True, 'message': 'Leave request approved.'})
        elif new_status == LeaveRequest.LeaveStatus.REJECTED:
            leave_request.status = LeaveRequest.LeaveStatus.REJECTED
            leave_request.approved_by = user
            leave_request.save()
            # Here you might trigger a notification to the employee
            return JsonResponse({'success': True, 'message': 'Leave request rejected.'})
        else:
            return JsonResponse({'error': 'Invalid status provided. Must be "APPROVED" or "REJECTED".'}, status=400)

    return JsonResponse({'error': 'Invalid request method'}, status=405)


@csrf_exempt
def policy_list_create(request):
    user = get_user_from_request(request)
    if not user or not is_hr_officer(user):
        return JsonResponse({'error': 'Permission denied. HR Officer role required.'}, status=403)

    if request.method == 'GET':
        policies = Policy.objects.all()
        data = [{
            'id': p.id,
            'name': p.name,
            'description': p.description,
            'value': p.value,
            'is_active': p.is_active,
        } for p in policies]
        return JsonResponse({'success': True, 'policies': data})

    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            policy = Policy.objects.create(
                name=data['name'],
                description=data.get('description', ''),
                value=data['value'],
                is_active=data.get('is_active', True)
            )
            return JsonResponse({'success': True, 'message': 'Policy created', 'id': policy.id}, status=201)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)


@csrf_exempt
def policy_detail(request, policy_id):
    user = get_user_from_request(request)
    if not user or not is_hr_officer(user):
        return JsonResponse({'error': 'Permission denied. HR Officer role required.'}, status=403)

    try:
        policy = Policy.objects.get(pk=policy_id)
    except Policy.DoesNotExist:
        return JsonResponse({'error': 'Policy not found'}, status=404)

    if request.method == 'GET':
        return JsonResponse({
            'success': True,
            'policy': {
                'id': policy.id,
                'name': policy.name,
                'description': policy.description,
                'value': policy.value,
                'is_active': policy.is_active,
            }
        })

    if request.method == 'PUT':
        try:
            data = json.loads(request.body)
            policy.name = data.get('name', policy.name)
            policy.description = data.get('description', policy.description)
            policy.value = data.get('value', policy.value)
            policy.is_active = data.get('is_active', policy.is_active)
            policy.save()
            return JsonResponse({'success': True, 'message': 'Policy updated'})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

    if request.method == 'DELETE':
        policy.delete()
        return JsonResponse({'success': True, 'message': 'Policy deleted'}, status=204)

    return JsonResponse({'error': 'Method not allowed'}, status=405)
