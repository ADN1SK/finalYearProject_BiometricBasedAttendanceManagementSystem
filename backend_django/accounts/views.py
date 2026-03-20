import base64
import io
import json
import logging
import numpy as np
import cv2

from PIL import Image
from mtcnn import MTCNN
from deepface import DeepFace

from django.shortcuts import render, get_object_or_404
from django.contrib.admin.views.decorators import staff_member_required
from django.urls import reverse
from django.http import JsonResponse
from django.contrib.auth import get_user_model, authenticate, login, logout
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie

from .models import EmployeeDetail, BiometricTemplate

User = get_user_model()
logger = logging.getLogger(__name__)


# =====================================
# AUTHENTICATION Endpoints for SPA
# =====================================

@ensure_csrf_cookie
def get_csrf(request):
    return JsonResponse({'success': 'CSRF cookie set'})


@csrf_exempt
def api_login(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username')
            password = data.get('password')
            user = authenticate(request, username=username, password=password)
            if user is not None:
                login(request, user)

                # Determine highest role for UI purposes
                role = 'Employee'
                if user.is_administrator:
                    role = 'Administrator'
                elif user.is_hr_officer:
                    role = 'HR Officer'

                return JsonResponse({
                    'success': True,
                    'user': {
                        'id': str(user.id),
                        'username': user.username,
                        'role': role
                    }
                })
            else:
                return JsonResponse({'success': False, 'error': 'Invalid credentials'}, status=401)
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=400)
    return JsonResponse({'error': 'POST required'}, status=405)


@csrf_exempt
def api_logout(request):
    logout(request)
    return JsonResponse({'success': True})


def api_list_users(request):
    """Returns a list of all users for enrollment selection."""
    users = User.objects.all()
    user_list = []
    for u in users:
        detail = EmployeeDetail.objects.filter(user=u).first()
        dept = detail.department.name if detail and detail.department else "No Department"
        role = 'Employee'
        if u.is_administrator:
            role = 'Administrator'
        elif u.is_hr_officer:
            role = 'HR Officer'
            
        user_list.append({
            'id': str(u.id),
            'name': u.username,
            'email': u.email,
            'role': role,
            'department': dept,
            'enrolled': detail.biometric_enrolled if detail else False
        })
    return JsonResponse({'success': True, 'users': user_list})


# FAST DETECTOR (for /face/check/)
# =====================================

face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades +
    "haarcascade_frontalface_default.xml"
)

# =====================================
# ACCURATE DETECTOR (for enrollment)
# =====================================

try:
    detector = MTCNN()
    logger.info("MTCNN loaded")
except Exception as e:
    logger.error(e)
    detector = None

# =====================================
# CACHE
# =====================================

known_embeddings = []
known_user_ids = []
known_usernames = []


def load_known_embeddings():
    global known_embeddings
    global known_user_ids
    global known_usernames

    templates = BiometricTemplate.objects.filter(
        type=BiometricTemplate.BiometricType.FACE
    ).select_related("user")

    known_embeddings = [
        np.array(t.template_data)
        for t in templates
    ]

    known_user_ids = [
        str(t.user.id)
        for t in templates
    ]

    known_usernames = [
        t.user.username
        for t in templates
    ]

    logger.info(
        f"Loaded {len(known_embeddings)} templates"
    )


load_known_embeddings()

# =====================================
# CHALLENGES (Blink Removed)
# =====================================

CHALLENGES = [

    {
        "type": "center",
        "text": "Look Forward",
        "instruction": "Look straight"
    },

    {
        "type": "left",
        "text": "Turn Left",
        "instruction": "Turn left"
    },

    {
        "type": "right",
        "text": "Turn Right",
        "instruction": "Turn right"
    },

]


# =====================================
# FAST FACE CHECK (NO MTCNN)
# =====================================

@csrf_exempt
def check_face(request):
    try:

        data = json.loads(
            request.body
        )

        frame = data.get("frame")

        if not frame:
            return JsonResponse(
                {"face": False}
            )

        _, img_str = frame.split(
            ";base64,"
        )

        img = Image.open(
            io.BytesIO(
                base64.b64decode(img_str)
            )
        ).convert("RGB")

        img_np = np.array(img)

        gray = cv2.cvtColor(
            img_np,
            cv2.COLOR_RGB2GRAY
        )

        faces = face_cascade.detectMultiScale(
            gray,
            scaleFactor=1.2,
            minNeighbors=5,
            minSize=(60, 60),
        )

        if len(faces) == 1:
            return JsonResponse(
                {"face": True}
            )

        return JsonResponse(
            {"face": False}
        )

    except Exception as e:

        logger.error(e)

        return JsonResponse(
            {"face": False}
        )


# =====================================
# ENROLLMENT
# =====================================

@staff_member_required
def capture_face(request, user_id):
    user = get_object_or_404(
        User,
        pk=user_id
    )

    if request.method == "GET":
        request.session.pop(
            "face_frames",
            None
        )

        return render(
            request,
            "accounts/capture.html",
            {
                "user": user,
                "challenges": CHALLENGES,
            },
        )

    try:

        data = json.loads(
            request.body
        )

        frames = data.get(
            "frames",
            []
        )

        challenge = data.get(
            "challenge"
        )

        step = data.get(
            "step",
            0
        )

        if not frames:
            return JsonResponse(
                {
                    "success": False,
                    "error": "No frames",
                }
            )

        valid_frames = []
        movements = []

        for frame_data in frames:

            _, img_str = frame_data.split(
                ";base64,"
            )

            img = Image.open(
                io.BytesIO(
                    base64.b64decode(
                        img_str
                    )
                )
            ).convert("RGB")

            img_np = np.array(img)

            faces = detector.detect_faces(
                img_np
            )

            if len(faces) != 1:
                continue

            face = faces[0]

            x, y, w, h = face["box"]

            x = max(0, x)
            y = max(0, y)

            nose = face["keypoints"][
                "nose"
            ]

            left_eye = face["keypoints"][
                "left_eye"
            ]

            right_eye = face["keypoints"][
                "right_eye"
            ]

            movements.append(
                nose[0]
            )

            valid_frames.append(
                {
                    "image": img_np,
                    "box": [x, y, w, h],
                    "eyes": [
                        left_eye,
                        right_eye,
                    ],
                }
            )

        if len(valid_frames) < 8:
            return JsonResponse(
                {
                    "success": False,
                    "error": "Face not stable",
                }
            )

        move = (
                movements[-1]
                - movements[0]
        )

        # ==========
        # LIVENESS
        # ==========

        if challenge == "left" and move > -20:
            return JsonResponse(
                {
                    "success": False,
                    "error": "Turn more left",
                }
            )

        if challenge == "right" and move < 20:
            return JsonResponse(
                {
                    "success": False,
                    "error": "Turn more right",
                }
            )

        # Blink validation block removed from here

        # ==========
        # STORE
        # ==========

        if "face_frames" not in request.session:
            request.session[
                "face_frames"
            ] = {}

        face_data = []

        for f in valid_frames:
            x, y, w, h = f["box"]

            face = f["image"][
                y:y + h,
                x:x + w,
            ]

            face = cv2.resize(
                face,
                (160, 160)
            )

            _, buf = cv2.imencode(
                ".jpg",
                cv2.cvtColor(
                    face,
                    cv2.COLOR_RGB2BGR,
                ),
                [
                    int(
                        cv2.IMWRITE_JPEG_QUALITY
                    ),
                    80,
                ],
            )

            face_data.append(
                base64.b64encode(
                    buf
                ).decode()
            )

        request.session[
            "face_frames"
        ][str(step)] = face_data

        request.session.modified = True

        # ==========
        # FINAL
        # ==========

        if step >= len(
                CHALLENGES
        ) - 1:

            all_faces = []

            for i in range(
                    len(
                        CHALLENGES
                    )
            ):
                all_faces.extend(
                    request.session[
                        "face_frames"
                    ].get(
                        str(i),
                        [],
                    )
                )

            embeddings = []

            for f in all_faces[:8]:

                img_bytes = base64.b64decode(
                    f
                )

                img_np = cv2.imdecode(
                    np.frombuffer(
                        img_bytes,
                        np.uint8,
                    ),
                    cv2.IMREAD_COLOR,
                )

                img_rgb = cv2.cvtColor(
                    img_np,
                    cv2.COLOR_BGR2RGB,
                )

                try:

                    rep = DeepFace.represent(
                        img_path=img_rgb,
                        model_name="Facenet512",
                        enforce_detection=False,
                        detector_backend="skip",
                    )

                    embeddings.append(
                        rep[0][
                            "embedding"
                        ]
                    )

                except Exception as e:

                    logger.error(e)

            if len(
                    embeddings
            ) < 5:
                return JsonResponse(
                    {
                        "success": False,
                        "error": "Embedding error",
                    }
                )

            avg = np.mean(
                embeddings,
                axis=0,
            ).tolist()

            # ==========
            # DUPLICATE
            # ==========

            if known_embeddings:

                q = np.array(
                    avg
                )

                q = q / (
                        np.linalg.norm(
                            q
                        )
                        + 1e-7
                )

                best_i = -1
                best_s = 0

                for i, emb in enumerate(
                        known_embeddings
                ):

                    e = emb / (
                            np.linalg.norm(
                                emb
                            )
                            + 1e-7
                    )

                    sim = np.dot(
                        q,
                        e,
                    )

                    if (
                            sim > 0.8
                            and sim
                            > best_s
                    ):
                        best_s = sim
                        best_i = i

                if (
                        best_i != -1
                        and known_user_ids[
                    best_i
                ]
                        != str(
                    user.id
                )
                ):
                    return JsonResponse(
                        {
                            "success": False,
                            "error": f"Already used by {known_usernames[best_i]}",
                        }
                    )

            BiometricTemplate.objects.update_or_create(
                user=user,
                type=BiometricTemplate.BiometricType.FACE,
                defaults={
                    "template_data": avg
                },
            )

            EmployeeDetail.objects.update_or_create(
                user=user,
                defaults={
                    "biometric_enrolled": True
                },
            )

            request.session.pop(
                "face_frames",
                None,
            )

            load_known_embeddings()

            return JsonResponse(
                {
                    "success": True,
                    "completed": True,
                    "redirect": reverse(
                        "admin:accounts_user_change",
                        args=[
                            user.pk
                        ],
                    ),
                }
            )

        return JsonResponse(
            {
                "success": True,
                "next_step": step + 1,
                "next_challenge": CHALLENGES[
                    step + 1
                    ],
            }
        )

    except Exception as e:

        logger.exception(e)

        return JsonResponse(
            {
                "success": False,
                "error": str(e),
            }
        )