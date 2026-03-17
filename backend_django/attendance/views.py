from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from django.contrib.admin.views.decorators import staff_member_required
from accounts.models import BiometricTemplate, User
from scheduling.models import Assignment
from .models import AttendanceRecord
import base64
import numpy as np
from PIL import Image
import io
from mtcnn import MTCNN
from deepface import DeepFace
from scipy.spatial.distance import cosine
import json
from datetime import datetime
import cv2

# Initialize face detector
detector = MTCNN()

# --- In-Memory Embedding Cache ---
known_embeddings_matrix = None
known_user_info = []

def load_known_embeddings():
    global known_embeddings_matrix, known_user_info
    
    templates = list(BiometricTemplate.objects.filter(type=BiometricTemplate.BiometricType.FACE).select_related('user'))
    
    if not templates:
        known_embeddings_matrix = None
        known_user_info = []
        print("No face embeddings found in the database.")
        return

    known_user_info = [{
        'user_id': str(template.user.id),
        'username': template.user.username
    } for template in templates]
    
    embeddings = [np.array(template.template_data) for template in templates]
    known_embeddings_matrix = np.array(embeddings)
    
    # Normalize the matrix for faster cosine similarity calculation
    norms = np.linalg.norm(known_embeddings_matrix, axis=1, keepdims=True)
    known_embeddings_matrix = known_embeddings_matrix / norms

    print(f"Loaded and normalized {len(known_user_info)} face embeddings into memory.")

load_known_embeddings()

@staff_member_required
def reload_embeddings(request):
    load_known_embeddings()
    return JsonResponse({'status': 'success', 'message': f'Reloaded {len(known_user_info)} embeddings.'})

# --- Face Recognition Logic ---
def extract_embedding(face_rgb):
    try:
        embedding_objs = DeepFace.represent(
            img_path=face_rgb, model_name='Facenet512',
            enforce_detection=False, detector_backend='skip',
            anti_spoofing=True
        )
        is_real = embedding_objs[0].get('is_real', True)
        return embedding_objs[0]['embedding'], is_real
    except TypeError:
        # Fallback if deepface version doesn't support anti_spoofing parameter
        embedding_objs = DeepFace.represent(
            img_path=face_rgb, model_name='Facenet512',
            enforce_detection=False, detector_backend='skip'
        )
        return embedding_objs[0]['embedding'], True
    except Exception:
        return None, False

def is_live_face(face_img):
    """
    Basic heuristic liveness check using OpenCV variance of Laplacian.
    Screens often display blur or moire patterns compared to live faces.
    """
    try:
        if face_img.shape[2] == 3:
            gray = cv2.cvtColor(face_img, cv2.COLOR_RGB2GRAY)
        else:
            gray = face_img
        
        # Calculate the Laplacian variance (measure of focus/sharpness)
        variance = cv2.Laplacian(gray, cv2.CV_64F).var()
        
        # A very low threshold indicates a blurry image (often a screen recording/photo)
        # 50.0 is a reasonable baseline but might need tuning.
        if variance < 50.0:
            return False, f"Spoof detected (Too blurry/Low texture: {variance:.1f})"
            
        return True, "Passed"
    except Exception as e:
        return True, "Skipped" # fail open if cv2 processing fails

def find_best_match(query_embedding, threshold=0.6):
    if known_embeddings_matrix is None:
        return None, float('inf')

    # Normalize the query embedding
    query_embedding_normalized = query_embedding / np.linalg.norm(query_embedding)
    
    # Perform dot product (cosine similarity) between normalized vectors
    similarities = np.dot(known_embeddings_matrix, query_embedding_normalized)
    
    # Cosine distance is 1 - similarity
    distances = 1 - similarities
    
    best_match_index = np.argmin(distances)
    min_distance = distances[best_match_index]

    if min_distance < threshold:
        best_match = known_user_info[best_match_index]
        return best_match, min_distance
        
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

        # --- Image Processing and Face Recognition ---
        format, imgstr = image_data.split(';base64,')
        image_content = base64.b64decode(imgstr)
        image = Image.open(io.BytesIO(image_content)).convert('RGB')
        image_array = np.array(image)
        faces = detector.detect_faces(image_array)
        if not faces:
            return JsonResponse({'error': 'No face detected'}, status=400)
        if len(faces) > 1:
            return JsonResponse({'error': 'Multiple faces detected'}, status=400)

        x, y, w, h = faces[0]['box']
        face_img = image_array[y:y+h, x:x+w]
        
        # Perform custom liveness check heuristic first before deepface
        is_live, msg = is_live_face(face_img)
        if not is_live:
             return JsonResponse({'error': f'Spoofing detected. Please provide a live face image. Details: {msg}'}, status=403)
             
        live_embedding, is_real = extract_embedding(face_img)
        if not live_embedding:
            return JsonResponse({'error': 'Could not process face'}, status=500)
            
        # Deepface's own anti-spoofing check
        if not is_real:
            return JsonResponse({'error': 'Spoofing detected by deepface. Please provide a live face image.'}, status=403)

        match, distance = find_best_match(np.array(live_embedding))
        if not match:
            return JsonResponse({'error': 'Face not recognized'}, status=404)

        # --- Enhanced Attendance Logic with Shift Scheduling ---
        user = User.objects.get(id=match['user_id'])
        now = timezone.now()
        today = now.date()
        current_time = now.time()

        last_record = AttendanceRecord.objects.filter(user=user).order_by('-timestamp').first()

        record_type = AttendanceRecord.RecordType.CHECK_IN
        if last_record and last_record.type == AttendanceRecord.RecordType.CHECK_IN:
            record_type = AttendanceRecord.RecordType.CHECK_OUT

        # Determine status based on shift
        status = AttendanceRecord.RecordStatus.ON_TIME
        assignment = Assignment.objects.filter(
            user=user, 
            from_date__lte=today, 
            to_date__gte=today
        ).select_related('shift').first()

        if assignment:
            shift = assignment.shift
            if record_type == AttendanceRecord.RecordType.CHECK_IN:
                if current_time > shift.start_time:
                    status = AttendanceRecord.RecordStatus.LATE
            elif record_type == AttendanceRecord.RecordType.CHECK_OUT:
                if current_time < shift.end_time:
                    status = AttendanceRecord.RecordStatus.EARLY_EXIT
        
        # Create the new attendance record
        new_record = AttendanceRecord.objects.create(
            user=user,
            timestamp=now,
            type=record_type,
            status=status
        )

        message = f"Successfully {record_type.lower().replace('_', ' ')}."
        return JsonResponse({
            'success': True,
            'type': record_type,
            'username': user.username,
            'status': status,
            'message': message,
            'timestamp': new_record.timestamp.isoformat()
        })

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON format.'}, status=400)
    except Exception as e:
        return JsonResponse({'error': f'An unexpected error occurred: {str(e)}'}, status=500)
