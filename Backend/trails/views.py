from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Trail, TrailPoint, TrailImage
from .serializers import TrailSerializer, TrailPointSerializer, TrailImageSerializer
from django.http import JsonResponse

# Add Trail View (includes checklist items)
class AddTrailView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        data = request.data
        
        trail_data = {
            "name": data.get("name"),
            "location": data.get("location"),
            "difficulty": data.get("difficulty"),
            "distance": data.get("distance"),
            "elevation": data.get("elevation"),
            "estimated_time": data.get("estimated_time"),
            "description": data.get("description"),
        }

        serializer = TrailSerializer(data=trail_data)
        if serializer.is_valid():
            trail = serializer.save()

            # Handle Trail Points
            points_data = data.get("points", [])
            for point in points_data:
                point_data = {
                    "trail": trail.id,
                    "latitude": point["latitude"],
                    "longitude": point["longitude"],
                    "nickname": point.get("nickname", ""),
                    "description": point.get("description", "")
                }
                point_serializer = TrailPointSerializer(data=point_data)
                if point_serializer.is_valid():
                    point_serializer.save()

            # Handle Trail Images (if any)
            images = data.getlist("images", [])
            for image in images:
                image_data = {
                    "trail": trail.id,
                    "image_url": image.url,
                }
                image_serializer = TrailImageSerializer(data=image_data)
                if image_serializer.is_valid():
                    image_serializer.save()

            # Handle Checklist items
            checklist_items = data.get("checklist", [])
            for item in checklist_items:
                checklist_data = {
                    "trail": trail.id,
                    "item_name": item["item_name"],
                }
                checklist_serializer = ChecklistSerializer(data=checklist_data)
                if checklist_serializer.is_valid():
                    checklist_serializer.save()

            return JsonResponse({"message": "Trail added successfully"}, status=201)

        return JsonResponse({"error": "Invalid data", "details": serializer.errors}, status=400)


# Update Trail
class UpdateTrailView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, trail_id):
        trail = get_object_or_404(Trail, id=trail_id)
        data = request.data

        trail_data = {
            "name": data.get("name", trail.name),
            "location": data.get("location", trail.location),
            "difficulty": data.get("difficulty", trail.difficulty),
            "distance": data.get("distance", trail.distance),
            "elevation": data.get("elevation", trail.elevation),
            "estimated_time": data.get("estimated_time", trail.estimated_time),
            "description": data.get("description", trail.description),
        }

        serializer = TrailSerializer(trail, data=trail_data, partial=True)
        if serializer.is_valid():
            trail = serializer.save()

            # Update Trail Points
            points_data = data.get("points", [])
            for point in points_data:
                point_data = {
                    "trail": trail.id,
                    "latitude": point["latitude"],
                    "longitude": point["longitude"],
                    "nickname": point.get("nickname", ""),
                    "description": point.get("description", "")
                }
                point_serializer = TrailPointSerializer(data=point_data)
                if point_serializer.is_valid():
                    point_serializer.save()

            # Handle Trail Images (if any)
            images = data.getlist("images", [])
            for image in images:
                image_data = {
                    "trail": trail.id,
                    "image_url": image.url,
                    "image_type": "Trail"
                }
                image_serializer = TrailImageSerializer(data=image_data)
                if image_serializer.is_valid():
                    image_serializer.save()

            return JsonResponse({"message": "Trail updated successfully"}, status=200)

        return JsonResponse({"error": "Invalid data", "details": serializer.errors}, status=400)


# Delete Trail
class DeleteTrailView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, trail_id):
        trail = get_object_or_404(Trail, id=trail_id)
        trail.delete()
        return JsonResponse({"message": "Trail deleted successfully"}, status=204)


# List All Trails
class ListTrailsView(APIView):
    def get(self, request):
        trails = Trail.objects.all()
        serializer = TrailSerializer(trails, many=True)
        return JsonResponse({"trails": serializer.data}, status=200)


# Retrieve Single Trail
class RetrieveTrailView(APIView):
    def get(self, request, trail_id):
        trail = get_object_or_404(Trail, id=trail_id)
        serializer = TrailSerializer(trail)
        return JsonResponse({"trail": serializer.data}, status=200)
