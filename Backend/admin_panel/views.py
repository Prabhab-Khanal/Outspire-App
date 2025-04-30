from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from users.models import User

class AdminLoginView(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response({'error': 'Email and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
            print(user.role)
        except User.DoesNotExist:
            return Response({'error': 'Invalid email or password.'}, status=status.HTTP_401_UNAUTHORIZED)

        if   user.role != 'Admin':

            return Response({'error': 'Access Denied. Only Admins can login.'}, status=status.HTTP_403_FORBIDDEN)

        refresh = RefreshToken.for_user(user)

        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'username': user.username,
            'role': user.role,
        }, status=status.HTTP_200_OK)

from rest_framework.permissions import IsAuthenticated

class AdminUserListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not (request.user.role == 'Admin' and request.user.is_staff):
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        users = User.objects.all()
        users_data = [{
            'user_id': u.user_id,
            'username': u.username,
            'email': u.email,
            'role': 'Premium' if u.is_premium else u.role,
            'is_active': u.is_active,
            'is_email_verified': u.is_email_verified,
            'is_profile_complete': u.is_profile_complete,
        } for u in users]


        return Response(users_data, status=status.HTTP_200_OK)


class AdminUpdateEmailVerifiedView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, user_id):
        if not (request.user.role == 'Admin' and request.user.is_staff):
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        action = request.data.get('action')
        if action not in ['verify', 'unverify']:
            return Response({'error': 'Invalid action. Use "verify" or "unverify".'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(user_id=user_id)
            user.is_email_verified = (action == 'verify')
            user.save()

            return Response({'message': f"User email verification status set to {user.is_email_verified}"}, status=status.HTTP_200_OK)

        except User.DoesNotExist:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)


from trails.models import Trail

class AdminApproveTrailView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, trail_id):
        if not (request.user.role == 'Admin' and request.user.is_staff):
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        try:
            trail = Trail.objects.get(id=trail_id)
            trail.is_approved = True
            trail.save()

            return Response({'message': f"Trail '{trail.name}' approved successfully."}, status=status.HTTP_200_OK)

        except Trail.DoesNotExist:
            return Response({'error': 'Trail not found.'}, status=status.HTTP_404_NOT_FOUND)


from community.models import Post

class AdminDashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not (request.user.role == 'Admin' and request.user.is_staff):
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        dashboard_data = {
            'users': {
                'total': User.objects.count(),
                'active': User.objects.filter(is_active=True).count(),
                'premium': User.objects.filter(is_premium=True).count(),
            },
            'trails': {
                'total': Trail.objects.count(),
                'approved': Trail.objects.filter(is_approved=True).count(),
            },
            'posts': {
                'total': Post.objects.count(),
            }
        }
        return Response(dashboard_data, status=status.HTTP_200_OK)


from notifications.models import Notification

class AdminSendNotificationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not (request.user.role == 'Admin' and request.user.is_staff):
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        target = request.data.get('target')  # 'all', 'premium', 'regular'
        title = request.data.get('title')
        body = request.data.get('body')

        if not (target and title and body):
            return Response({'error': 'target, title and body required.'}, status=status.HTTP_400_BAD_REQUEST)

        if target == 'all':
            users = User.objects.all()
        elif target == 'premium':
            users = User.objects.filter(role='Premium')
        else:
            users = User.objects.filter(role='Regular')

        for user in users:
            Notification.objects.create(
                receiver=user,
                title=title,
                body=body,
                type='custom'
            )

        return Response({'message': f"Notification sent to {users.count()} users."}, status=status.HTTP_200_OK)


from payments.models import Payment  # adjust path if needed
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

@method_decorator(csrf_exempt, name='dispatch')
class AdminPaymentListView(APIView):
    def get(self, request):
        if not (request.user.is_authenticated and request.user.role == 'Admin' and request.user.is_staff):
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        payments = Payment.objects.all().order_by('-created_at')

        payment_data = []
        for payment in payments:
            payment_data.append({
                'payment_id': payment.id,
                'user': payment.user.username,
                'amount': payment.amount,
                'payment_status': payment.payment_status,
                'created_at': payment.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            })

        return Response(payment_data, status=status.HTTP_200_OK)


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from trails.models import Trail, TrailSegment, Waypoint, TrailImage, OfflineMap, TrailReview, WaypointImage
import json

# ✅ 1. List all trails
@method_decorator(csrf_exempt, name='dispatch')
class AdminListTrailsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not (request.user.role == 'Admin' and request.user.is_staff):
            return Response({'error': 'Unauthorized'}, status=403)

        trails = Trail.objects.all().order_by('-created_at')
        return Response([
            {
                'id': t.id,
                'name': t.name,
                'type': t.type,
                'location': t.location,
                'is_approved': t.is_approved,
                'created_at': t.created_at.strftime('%Y-%m-%d %H:%M:%S')
            }
            for t in trails
        ])


# ✅ 2. View full trail detail
@method_decorator(csrf_exempt, name='dispatch')
class AdminTrailDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, trail_id):
        if not (request.user.role == 'Admin' and request.user.is_staff):
            return Response({'error': 'Unauthorized'}, status=403)

        try:
            trail = Trail.objects.prefetch_related('segments', 'waypoints__images', 'images', 'offline_maps', 'reviews').get(id=trail_id)

            return Response({
                'id': trail.id,
                'name': trail.name,
                'type': trail.type,
                'location': trail.location,
                'description': trail.description,
                'difficulty': trail.difficulty,
                'distance_km': trail.distance_km,
                'highest_altitude': trail.highest_altitude,
                'is_approved': trail.is_approved,
                'checklist': trail.checklist,
                'created_at': trail.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                'images': [img.image.url for img in trail.images.all()],
                'segments': [{'routed': s.routed, 'points': s.points} for s in trail.segments.all()],
                'waypoints': [{
                    'id': w.id,
                    'name': w.name,
                    'description': w.description,
                    'latitude': w.latitude,
                    'longitude': w.longitude,
                    'images': [img.image.url for img in w.images.all()]
                } for w in trail.waypoints.all()],
                'reviews': [{
                    'rating': r.rating,
                    'comment': r.comment,
                    'created_at': r.created_at.strftime('%Y-%m-%d %H:%M:%S')
                } for r in trail.reviews.all()],
            })
        except Trail.DoesNotExist:
            return Response({'error': 'Trail not found.'}, status=404)

# ✅ 3. Approve / Disapprove
@method_decorator(csrf_exempt, name='dispatch')
class AdminToggleTrailApprovalView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, trail_id):
        if not (request.user.role == 'Admin' and request.user.is_staff):
            return Response({'error': 'Unauthorized'}, status=403)

        try:
            trail = Trail.objects.get(id=trail_id)
            trail.is_approved = not trail.is_approved
            trail.save()
            return Response({'message': f"Trail '{trail.name}' is now {'approved' if trail.is_approved else 'disapproved'}."})
        except Trail.DoesNotExist:
            return Response({'error': 'Trail not found.'}, status=404)


# ✅ 4. Delete a trail
@method_decorator(csrf_exempt, name='dispatch')
class AdminDeleteTrailView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, trail_id):
        if not (request.user.role == 'Admin' and request.user.is_staff):
            return Response({'error': 'Unauthorized'}, status=403)

        try:
            trail = Trail.objects.get(id=trail_id)
            trail.delete()
            return Response({'message': f"Trail '{trail.name}' has been deleted."})
        except Trail.DoesNotExist:
            return Response({'error': 'Trail not found.'}, status=404)


# ✅ 5. Admin Create Trail
@method_decorator(csrf_exempt, name='dispatch')
class AdminCreateTrailView(APIView):
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not (request.user.role == 'Admin' and request.user.is_staff):
            return Response({'error': 'Unauthorized'}, status=403)

        data = request.data
        checklist = json.loads(data.get('checklist', '[]'))
        raw_points = json.loads(data.get('rawPoints', '[]'))
        trail_segments = json.loads(data.get('trailSegments', '[]'))
        trail_images = request.FILES.getlist('trail_images')

        trail = Trail.objects.create(
            created_by=request.user,
            name=data.get('name'),
            type=data.get('type'),
            location=data.get('location'),
            difficulty=data.get('difficulty'),
            description=data.get('description'),
            distance_km=data.get('distance_km'),
            highest_altitude=data.get('highest_altitude'),
            checklist=checklist,
            is_approved=True
        )

        uploaded_trail_images = [TrailImage.objects.create(image=img) for img in trail_images]
        trail.images.set(uploaded_trail_images)

        waypoint_uploaded_files = request.FILES.getlist('waypoint_images')
        waypoint_file_mapping = {f.name: f for f in waypoint_uploaded_files}

        for point in raw_points:
            waypoint_images = []
            for image_filename in point.get('images', []):
                image_file = waypoint_file_mapping.get(image_filename)
                if image_file:
                    waypoint_image = WaypointImage.objects.create(image=image_file)
                    waypoint_images.append(waypoint_image)

            wp = Waypoint.objects.create(
                trail=trail,
                name=point.get('name', ''),
                description=point.get('description', ''),
                latitude=point['latitude'],
                longitude=point['longitude'],
            )
            wp.images.set(waypoint_images)

        for seg in trail_segments:
            TrailSegment.objects.create(
                trail=trail,
                routed=seg.get('routed', True),
                points=seg.get('points', [])
            )

        return Response({"message": "Trail created successfully."}, status=201)





from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from community.models import Post
from users.models import User
from django.conf import settings

class AdminPostListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not (request.user.is_staff and request.user.role == 'Admin'):
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        posts = Post.objects.select_related('user').prefetch_related('post_images', 'comments', 'likes')
        post_data = []

        for post in posts.order_by('-created_at'):
            post_data.append({
                'id': post.id,
                'caption': post.caption,
                'location': post.location,
                'created_at': post.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                'user': {
                    'username': post.user.username,
                    'profile_picture': request.build_absolute_uri(post.user.profile_picture.url) if post.user.profile_picture else None,
                },
                'images': [request.build_absolute_uri(img.image.url) for img in post.post_images.all()],
                'likes_count': post.likes.count(),
                'comments_count': post.comments.count(),
            })

        return Response(post_data, status=status.HTTP_200_OK)

    


from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

class AdminToggleHidePostView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, post_id):
        if not (request.user.is_staff and request.user.role == 'Admin'):
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        try:
            post = Post.objects.get(id=post_id)
            post.is_hidden = not post.is_hidden
            post.save()
            action = "hidden" if post.is_hidden else "visible"
            return Response({'message': f"Post {post.id} is now {action}."}, status=status.HTTP_200_OK)
        except Post.DoesNotExist:
            return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)

class AdminDeletePostView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, post_id):
        if not (request.user.is_staff and request.user.role == 'Admin'):
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        try:
            post = Post.objects.get(id=post_id)
            post.delete()
            return Response({'message': f"Post {post_id} deleted."}, status=status.HTTP_200_OK)
        except Post.DoesNotExist:
            return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)


class AdminPostDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, post_id):
        if not (request.user.role == 'Admin' and request.user.is_staff):
            return Response({'error': 'Unauthorized'}, status=403)

        try:
            post = Post.objects.get(id=post_id)
            comments = post.comments.all().order_by('created_at')
            return Response({
                'id': post.id,
                'caption': post.caption,
                'location': post.location,
                'created_at': post.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                'is_hidden': post.is_hidden,
                'user': {
                    'username': post.user.username,
                    'profile_picture': request.build_absolute_uri(post.user.profile_picture.url) if post.user.profile_picture else None,
                },
                'images': [request.build_absolute_uri(img.image.url) for img in post.post_images.all()],
                'likes_count': post.likes.count(),
                'comments_count': post.comments.count(),
                'comments': [{
                    'id': c.id,
                    'username': c.user.username,
                    'text': c.text,
                    'created_at': c.created_at.strftime('%Y-%m-%d %H:%M:%S')
                } for c in comments]
            })
        except Post.DoesNotExist:
            return Response({'error': 'Post not found'}, status=404)


from users.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

class AdminBanUserView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, user_id):
        if not (request.user.role == 'Admin' and request.user.is_staff):
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        try:
            user = User.objects.get(user_id=user_id)
            user.is_active = False
            user.is_email_verified = False
            user.save()
            return Response({'message': f"User '{user.username}' has been banned and unverified."}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from users.models import User

class AdminToggleBanUserView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, user_id):
        if not (request.user.role == 'Admin' and request.user.is_staff):
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        try:
            user = User.objects.get(user_id=user_id)

            # Toggle ban status
            user.is_active = not user.is_active
            if not user.is_active:
                user.is_email_verified = False  # unverify if banned
            user.save()

            action = "banned" if not user.is_active else "unbanned"
            return Response({'message': f"User '{user.username}' has been {action}."}, status=status.HTTP_200_OK)

        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)









from django.http import JsonResponse
from sos.models import SOSAlert
from users.models import EmergencyContact
from django.views.decorators.csrf import csrf_exempt
from django.utils.timezone import localtime

@csrf_exempt
def public_sos_list(request):
    if request.method != 'GET':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    sos_entries = SOSAlert.objects.select_related('user').order_by('-timestamp')
    data = []

    for sos in sos_entries:
        try:
            user = sos.user
            # fallback handling
            user_id = getattr(user, 'pk', None)
            username = getattr(user, 'username', 'Unknown')

            emergency = EmergencyContact.objects.filter(user=user, is_primary=True).first()

            data.append({
                'sos_id': sos.id,
                'user_id': user_id,
                'username': username,
                'latitude': sos.latitude,
                'longitude': sos.longitude,
                'timestamp': localtime(sos.timestamp).strftime('%Y-%m-%d %H:%M:%S'),
                'emergency_contact': {
                    'contact_name': emergency.contact_name if emergency else None,
                    'phone_number': emergency.phone_number if emergency else None,
                    'email': emergency.email if emergency else None,
                    'relationship': emergency.relationship if emergency else None,
                } if emergency else None
            })
        except Exception as e:
            print(f"Error processing SOSAlert {sos.id}: {e}")
            continue

    return JsonResponse(data, safe=False)



    return JsonResponse(data, safe=False)


