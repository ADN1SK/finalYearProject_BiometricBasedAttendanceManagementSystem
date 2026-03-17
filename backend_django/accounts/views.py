from django.shortcuts import render, get_object_or_404
from django.contrib.admin.views.decorators import staff_member_required
from django.urls import reverse
from django.contrib import messages
from .models import User, EmployeeDetail, BiometricTemplate
import base64
from django.core.files.base import ContentFile
import numpy as np
from PIL import Image
import io
import json
from mtcnn import MTCNN
from deepface import DeepFace
from scipy.spatial.distance import cosine
from django.http import JsonResponse

# --- Face Recognition Logic and Cache ---
detector = MTCNN()
known_embeddings_matrix = None
known_user_info = []

def load_known_embeddings():
    """Loads all face embeddings from the database into memory."""
    global known_embeddings_matrix, known_user_info
    
    templates = list(BiometricTemplate.objects.filter(type=BiometricTemplate.BiometricType.FACE).select_related('user'))
    
    if not templates:
        known_embeddings_matrix = None
        known_user_info = []
        print("No face embeddings found in the database for enrollment check.")
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

    print(f"Loaded and normalized {len(known_user_info)} face embeddings for enrollment check.")

load_known_embeddings()

def extract_embedding(face_rgb):
    """Extracts a face embedding using DeepFace."""
    try:
        embedding_objs = DeepFace.represent(
            img_path=face_rgb, model_name='Facenet512',
            enforce_detection=False, detector_backend='skip'
        )
        return embedding_objs[0]['embedding']
    except Exception as e:
        print(f"Error extracting embedding: {e}")
        return None

def find_best_match(query_embedding, threshold=0.6):
    """Finds the best match for a given embedding from the known embeddings."""
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

def perform_liveness_check(image_frames, challenge_type):
    """
    Performs a liveness check and returns the detected face from the center frame.
    Returns (is_successful, message, center_frame_array, center_frame_face_details).
    """
    nose_positions = []
    decoded_frames = []
    detected_faces_data = []

    if not image_frames:
        return False, "No image frames received. Please try again.", None, None

    for frame_data in image_frames:
        try:
            format, imgstr = frame_data.split(';base64,')
            image_content = ContentFile(base64.b64decode(imgstr))
            image = Image.open(image_content).convert('RGB')
            decoded_frames.append(np.array(image))
        except (ValueError, TypeError):
            continue

    if len(decoded_frames) < 3:
        return False, "Could not read enough frames. Please ensure a stable connection.", None, None

    for frame_array in decoded_frames:
        faces = detector.detect_faces(frame_array)
        if len(faces) == 0:
            return False, "Could not detect a face in one or more frames. Ensure your face is clearly visible.", None, None
        if len(faces) > 1:
            return False, "Multiple faces detected. Ensure only one person is in the frame.", None, None
        
        detected_faces_data.append(faces[0])
        nose_positions.append(faces[0]['keypoints']['nose'][0])

    start_pos, end_pos = nose_positions[0], nose_positions[-1]
    movement_threshold = 25

    is_moving_correctly = False
    if challenge_type == 'head_turn_left' and start_pos - end_pos > movement_threshold:
        is_moving_correctly = True
    elif challenge_type == 'head_turn_right' and end_pos - start_pos > movement_threshold:
        is_moving_correctly = True

    if not is_moving_correctly:
        return False, "Liveness check failed: Head movement not detected. Please follow the instructions.", None, None

    center_frame_index = len(decoded_frames) // 2
    center_frame = decoded_frames[center_frame_index]
    center_face_details = detected_faces_data[center_frame_index]
    
    return True, "Liveness check successful.", center_frame, center_face_details

# --- Admin Face Capture View ---

@staff_member_required
def capture_face(request, user_id):
    user = get_object_or_404(User, pk=user_id)

    if request.method == 'POST':
        try:
            image_frames_json = request.POST.get('image_frames')
            challenge_type = request.POST.get('challenge_type')

            if not image_frames_json or not challenge_type:
                return JsonResponse({'success': False, 'message': 'Liveness check data is missing.'})

            image_frames = json.loads(image_frames_json)
            
            is_live, message, center_frame, face_details = perform_liveness_check(image_frames, challenge_type)
            
            if not is_live:
                return JsonResponse({'success': False, 'message': message})

            x, y, w, h = face_details['box']
            face_img = center_frame[y:y+h, x:x+w]
            embedding = extract_embedding(face_img)

            if embedding is None:
                return JsonResponse({'success': False, 'message': 'Could not extract face features. Please try again with better lighting.'})

            match, distance = find_best_match(np.array(embedding))
            if match and match['user_id'] != str(user.id):
                message = f"Enrollment failed. This face is already registered to user '{match['username']}'."
                return JsonResponse({'success': False, 'message': message})

            BiometricTemplate.objects.update_or_create(
                user=user,
                type=BiometricTemplate.BiometricType.FACE,
                defaults={'template_data': embedding}
            )

            try:
                user.employeedetail.biometric_enrolled = True
                user.employeedeetail.save()
            except EmployeeDetail.DoesNotExist:
                return JsonResponse({'success': False, 'message': 'Employee profile does not exist for this user.'})

            load_known_embeddings()
            
            messages.success(request, f"Face successfully enrolled for {user.username}.")
            redirect_url = reverse('admin:accounts_user_change', args=[user.pk])
            return JsonResponse({'success': True, 'redirect_url': redirect_url})

        except json.JSONDecodeError:
            return JsonResponse({'success': False, 'message': 'Invalid data format received from the browser.'})
        except Exception as e:
            return JsonResponse({'success': False, 'message': f'An unexpected error occurred: {e}'})

    return render(request, 'accounts/capture.html', {'user': user})
