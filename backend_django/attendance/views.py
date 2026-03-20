import logging
import base64
import numpy as np
import io
import json
import cv2
from PIL import Image
from deepface import DeepFace
from scipy.spatial.distance import cosine
from datetime import datetime

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from django.contrib.auth.decorators import login_required
from django.contrib.admin.views.decorators import staff_member_required

from mtcnn import MTCNN
# Internal model imports
from accounts.models import BiometricTemplate, User
from scheduling.models import Assignment
from .models import AttendanceRecord

# --- Logging Configuration ---
# Standard logger for this module
logger = logging.getLogger(__name__)

# --- Initialization ---
try:
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    if face_cascade.empty():
        logger.error("Haar Cascade classifier is empty. Face detection will fail.")
except Exception as e:
    logger.error(f"Could not load Haar Cascade classifier: {e}")
    face_cascade = None

# --- In-Memory Embedding Cache ---
known_embeddings_matrix = None
known_user_info = []


def load_known_embeddings():
    global known_embeddings_matrix, known_user_info

    try:
        templates = list(BiometricTemplate.objects.filter(
            type=BiometricTemplate.BiometricType.FACE
        ).select_related('user'))

        if not templates:
            known_embeddings_matrix = None
            known_user_info = []
            logger.warning("Cache Refresh: No face embeddings found in database.")
            return

        known_user_info = [{
            'user_id': str(template.user.id),
            'username': template.user.username
        } for template in templates]

        embeddings = [np.array(template.template_data) for template in templates]
        matrix = np.array(embeddings)

        # Normalize the matrix for faster cosine similarity calculation
        norms = np.linalg.norm(matrix, axis=1, keepdims=True)
        known_embeddings_matrix = matrix / norms

        logger.info(f"Cache Refresh: Loaded {len(known_user_info)} face embeddings into memory.")
    except Exception as e:
        logger.error(f"Failed to load embeddings into memory: {e}")


# Initial load
load_known_embeddings()


@csrf_exempt
def reload_embeddings(request):
    load_known_embeddings()
    return JsonResponse({'status': 'success', 'message': f'Reloaded {len(known_user_info)} embeddings.'})


# --- Face Recognition Logic ---
def extract_embedding(image_rgb, face_crop=None):
    try:
        # 1. Primary Attempt: MTCNN on full image for best alignment (matching enrollment best-case)
        embedding_objs = DeepFace.represent(
            img_path=image_rgb, model_name='Facenet512',
            enforce_detection=True, detector_backend='mtcnn',
            anti_spoofing=False
        )
        return embedding_objs[0]['embedding'], True
    except Exception as e:
        logger.warning(f"MTCNN full-image detection failed: {e}. Trying crop-based detection...")
        
        try:
            # 2. Secondary Attempt: Try MTCNN on the Haar-detected crop (more likely to succeed if face is small in frame)
            if face_crop is not None:
                embedding_objs = DeepFace.represent(
                    img_path=face_crop, model_name='Facenet512',
                    enforce_detection=True, detector_backend='mtcnn',
                    anti_spoofing=False
                )
                return embedding_objs[0]['embedding'], True
        except Exception as e2:
            logger.warning(f"MTCNN crop-based detection failed: {e2}. Final fallback to enrollment-style 'skip'...")

        try:
            # 3. Final Fallback: Match enrollment logic precisely (Haar crop + skip detector)
            target_img = face_crop if face_crop is not None else image_rgb
            
            # Match enrollment's 160x160 resizing exactly
            if target_img is not None:
                target_img = cv2.resize(target_img, (160, 160))
                
            embedding_objs = DeepFace.represent(
                img_path=target_img, model_name='Facenet512',
                enforce_detection=False, detector_backend='skip'
            )
            return embedding_objs[0]['embedding'], True
        except Exception as e3:
            logger.error(f"DeepFace final fallback extraction error: {e3}")
            return None, False


def is_live_face(face_img):
    """
    Heuristic liveness check using OpenCV variance of Laplacian.
    """
    try:
        if face_img.shape[2] == 3:
            gray = cv2.cvtColor(face_img, cv2.COLOR_RGB2GRAY)
        else:
            gray = face_img

        variance = cv2.Laplacian(gray, cv2.CV_64F).var()

        # Lowered threshold to 5.0 to be more permissive for various webcams
        if variance < 5.0:
            return False, f"Low texture variance: {variance:.1f}"

        return True, "Passed"
    except Exception as e:
        logger.warning(f"Liveness heuristic skipped due to error: {e}")
        return True, "Skipped"


def find_best_match(query_embedding, threshold=0.8):
    if known_embeddings_matrix is None:
        return None, float('inf')

    query_norm = np.linalg.norm(query_embedding)
    if query_norm == 0:
        return None, float('inf')

    query_embedding_normalized = query_embedding / query_norm
    similarities = np.dot(known_embeddings_matrix, query_embedding_normalized)
    # Ensure distances is at least a 1D array for safe indexing
    distances = np.atleast_1d(1 - similarities)

    # Get the indices of the sorted distances
    sorted_indices = np.argsort(distances)
    best_match_index = sorted_indices[0]
    min_distance = float(distances[best_match_index])

    if min_distance < threshold:
        # Extra safety: If the distance is borderline (e.g. > 0.7), 
        # ensure there is a significant gap to the second best match.
        if min_distance > 0.7 and len(distances) > 1:
            second_best_dist = distances[sorted_indices[1]]
            gap = second_best_dist - min_distance
            if gap < 0.1: # If the gap is too small, it's ambiguous
                logger.warning(f"Ambiguous Match: Best {min_distance:.4f}, Second {second_best_dist:.4f}. Rejecting.")
                return None, min_distance
        
        return known_user_info[best_match_index], min_distance

    return None, min_distance


# --- Main Attendance API View ---
@csrf_exempt
def mark_attendance(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method'}, status=405)

    try:
        data = json.loads(request.body)
        image_data = data.get('image')
        if not image_data:
            return JsonResponse({'error': 'No image data provided'}, status=400)

        # Decode image
        try:
            format, imgstr = image_data.split(';base64,')
            image_content = base64.b64decode(imgstr)
            image = Image.open(io.BytesIO(image_content)).convert('RGB')
            image_array = np.array(image)
        except Exception as e:
            logger.error(f"Image decoding failed: {e}")
            return JsonResponse({'error': 'Invalid image format'}, status=400)

        if face_cascade is None:
            logger.critical("Attendance API: Face detector is not initialized.")
            return JsonResponse({'error': 'System misconfiguration'}, status=500)

        # Detect face for initial presence check
        gray_image = cv2.cvtColor(image_array, cv2.COLOR_RGB2GRAY)
        faces = face_cascade.detectMultiScale(
            gray_image, scaleFactor=1.1, minNeighbors=5, minSize=(80, 80)
        )

        if len(faces) == 0:
            logger.warning("Attendance Failed: No face detected in request.")
            return JsonResponse({'error': 'Face not found in guide. Please align correctly.'}, status=400)
        if len(faces) > 1:
            logger.warning(f"Attendance Failed: {len(faces)} faces detected. Only one allowed.")
            return JsonResponse({'error': 'Multiple faces detected. One person at a time.'}, status=400)

        x, y, w, h = faces[0]
        face_img = image_array[y:y + h, x:x + w]

        # 1. Liveness Check (Heuristic)
        is_live, liveness_msg = is_live_face(face_img)
        if not is_live:
            logger.error(f"Security Alert: Heuristic Spoof Detection. {liveness_msg}")
            return JsonResponse({'error': 'Biometric verification failed (Liveness).'}, status=403)

        # 2. Embedding & Recognition (Deepface)
        # Passing full image_array to let DeepFace-MTCNN handle alignment consistently.
        live_embedding, _ = extract_embedding(image_array, face_crop=face_img)
        if live_embedding is None:
            return JsonResponse({'error': 'Biometric processing failed. Try better lighting.'}, status=500)

        # 3. Recognition Match
        match, distance = find_best_match(np.array(live_embedding))
        if not match:
            logger.info(f"Recognition Failed: Unknown person (Best dist: {distance:.4f})")
            return JsonResponse({
                'error': 'Identity not recognized. Ensure you are enrolled.',
                'distance': float(distance) # For debugging/logging
            }, status=401)

        # --- Attendance Logic ---
        user = User.objects.get(id=match['user_id'])
        now = timezone.now()
        today = now.date()

        # 1. Cooldown Check (to prevent double-taps)
        last_record = AttendanceRecord.objects.filter(user=user).order_by('-timestamp').first()
        if last_record:
            seconds_since_last = (now - last_record.timestamp).total_seconds()
            if seconds_since_last < 60:  # 1-minute cooldown
                logger.warning(f"Cooldown: {user.username} tried to mark again too soon ({seconds_since_last:.1f}s).")
                return JsonResponse({
                    'error': 'Already marked recently. Please wait a moment.',
                    'already_marked': True
                }, status=429)

        # 2. Daily Logic: Determine if CHECK_IN or CHECK_OUT
        # If no record today, always CHECK_IN. Otherwise toggle based on last status today.
        records_today = AttendanceRecord.objects.filter(user=user, timestamp__date=today).order_by('-timestamp')
        
        if not records_today.exists():
            record_type = AttendanceRecord.RecordType.CHECK_IN
        else:
            last_today = records_today.first()
            if last_today.type == AttendanceRecord.RecordType.CHECK_IN:
                record_type = AttendanceRecord.RecordType.CHECK_OUT
            else:
                record_type = AttendanceRecord.RecordType.CHECK_IN

        # 3. Status Calculation (Late / Early)
        status = AttendanceRecord.RecordStatus.ON_TIME
        current_time = now.time()
        
        assignment = Assignment.objects.filter(
            user=user, from_date__lte=today, to_date__gte=today
        ).select_related('shift').first()

        if assignment:
            shift = assignment.shift
            if record_type == AttendanceRecord.RecordType.CHECK_IN:
                if current_time > shift.start_time:
                    status = AttendanceRecord.RecordStatus.LATE
            elif record_type == AttendanceRecord.RecordType.CHECK_OUT:
                if current_time < shift.end_time:
                    status = AttendanceRecord.RecordStatus.EARLY_EXIT
                else:
                    status = AttendanceRecord.RecordStatus.ON_TIME # or OVERTIME

        new_record = AttendanceRecord.objects.create(
            user=user, 
            timestamp=now, 
            type=record_type, 
            status=status
        )

        logger.info(f"Attendance Success: {user.username} | {record_type} | Status: {status} | Dist: {distance:.4f}")

        return JsonResponse({
            'success': True,
            'type': record_type,
            'username': user.username,
            'status': status,
            'message': f"Successfully {record_type.label.lower()}.",
            'timestamp': new_record.timestamp.isoformat()
        })

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON format.'}, status=400)
    except Exception as e:
        logger.exception("Critical Error in mark_attendance view")
        return JsonResponse({'error': 'Internal server error processing biometric data.'}, status=500)


@login_required
def get_my_attendance_history(request):
    """
    Returns the latest 20 attendance records for the current user.
    """
    try:
        records = AttendanceRecord.objects.filter(user=request.user).order_by('-timestamp')[:20]
        data = []
        for r in records:
            data.append({
                'id': str(r.id),
                'timestamp': r.timestamp.isoformat(),
                'type': r.get_type_display(),
                'type_code': r.type,
                'status': r.get_status_display(),
                'status_code': r.status,
                'date': r.timestamp.date().strftime('%b %d, %Y'),
                'time': r.timestamp.time().strftime('%H:%M %p')
            })
        return JsonResponse({'success': True, 'records': data})
    except Exception as e:
        logger.error(f"Error fetching attendance history: {e}")
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@staff_member_required
def api_admin_stats(request):
    """Returns global statistics for the Admin dashboard."""
    try:
        now = timezone.now()
        today = now.date()
        
        total_employees = User.objects.filter(is_active=True).count()
        present_today = AttendanceRecord.objects.filter(
            timestamp__date=today, 
            type=AttendanceRecord.RecordType.CHECK_IN
        ).values('user').distinct().count()
        
        late_today = AttendanceRecord.objects.filter(
            timestamp__date=today,
            status=AttendanceRecord.RecordStatus.LATE
        ).values('user').distinct().count()
        
        # Simple absenteeism: Total - Present
        # (In a real system, you'd check against schedules)
        absent_today = total_employees - present_today
        
        return JsonResponse({
            'success': True,
            'stats': {
                'totalEmployees': total_employees,
                'presentToday': present_today,
                'absentToday': absent_today,
                'lateToday': late_today,
                'pendingLeaves': 5 # Placeholder until Leave integration
            }
        })
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)
@staff_member_required
def api_list_all_attendance(request):
    """Lists attendance records for all users (Admin view)."""
    try:
        records = AttendanceRecord.objects.all().select_related('user').order_by('-timestamp')[:100]
        data = []
        for r in records:
            data.append({
                'id': str(r.id),
                'username': r.user.username,
                'timestamp': r.timestamp.isoformat(),
                'type': r.get_type_display(),
                'status': r.get_status_display(),
                'date': r.timestamp.date().strftime('%b %d, %Y'),
                'time': r.timestamp.time().strftime('%H:%M %p')
            })
        return JsonResponse({'success': True, 'records': data})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@login_required
def get_my_attendance_stats(request):
    """
    Calculates monthly statistics for the current user.
    """
    try:
        # Get start of current month
        now = timezone.now()
        start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        # All records for this month
        records = AttendanceRecord.objects.filter(user=request.user, timestamp__gte=start_of_month)
        
        # Statistics
        present_days = records.values('timestamp__date').distinct().count()
        late_count = records.filter(status=AttendanceRecord.RecordStatus.LATE).count()
        early_exit_count = records.filter(status=AttendanceRecord.RecordStatus.EARLY_EXIT).count()
        
        # Calculate approximate total hours (simplified: sum of check-out - last check-in for each day)
        total_seconds = 0
        days = records.values_list('timestamp__date', flat=True).distinct()
        for d in days:
            day_records = records.filter(timestamp__date=d).order_by('timestamp')
            # Pair check-ins with check-outs
            last_in = None
            for r in day_records:
                if r.type == AttendanceRecord.RecordType.CHECK_IN:
                    last_in = r.timestamp
                elif r.type == AttendanceRecord.RecordType.CHECK_OUT and last_in:
                    total_seconds += (r.timestamp - last_in).total_seconds()
                    last_in = None
        
        total_hours = float(round(total_seconds / 3600.0, 1))

        return JsonResponse({
            'success': True,
            'stats': {
                'present_days': present_days,
                'late_count': late_count,
                'early_exit_count': early_exit_count,
                'total_hours': total_hours,
                'month_name': now.strftime('%B %Y')
            }
        })
    except Exception as e:
        logger.exception(f"Error calculating stats: {e}")
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@login_required
def api_hr_stats(request):
    """Returns statistics for the HR Officer dashboard."""
    from accounts.models import Role
    try:
        hr_role = Role.objects.get(name='HR Officer')
        if not request.user.roles.filter(id=hr_role.id).exists() and not request.user.is_superuser:
            return JsonResponse({'error': 'Permission denied'}, status=403)
    except Role.DoesNotExist:
        if not request.user.is_superuser:
            return JsonResponse({'error': 'Role configuration error'}, status=500)

    try:
        now = timezone.now()
        today = now.date()
        
        total_employees = User.objects.count()
        present_today = AttendanceRecord.objects.filter(
            timestamp__date=today, 
            type=AttendanceRecord.RecordType.CHECK_IN
        ).values('user').distinct().count()
        
        from leave.models import LeaveRequest
        pending_leaves = LeaveRequest.objects.filter(status='PENDING').count()
        
        from scheduling.models import Shift
        active_shifts = Shift.objects.count()

        return JsonResponse({
            'success': True,
            'stats': {
                'totalEmployees': total_employees,
                'presentToday': present_today,
                'pendingLeaves': pending_leaves,
                'activeShifts': active_shifts
            }
        })
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)