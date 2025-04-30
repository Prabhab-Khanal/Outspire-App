from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Trail, TrailSegment, Waypoint, OfflineMap, TrailReview, TrailImage, WaypointImage
from .serializers import TrailSerializer, TrailSegmentSerializer, WaypointSerializer, OfflineMapSerializer, TrailReviewSerializer
import json
from rest_framework.permissions import IsAuthenticated, AllowAny

# Create a new Trail with handling images and parsing fields
class TrailCreateView(generics.CreateAPIView):
    queryset = Trail.objects.all()
    serializer_class = TrailSerializer
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        data = request.data
        print("Received data for creating trail:", data)

        # Parse checklist
        checklist = json.loads(data.get('checklist', '[]'))
        print("Parsed checklist:", checklist)

        # Parse rawPoints and trailSegments
        raw_points = json.loads(data.get('rawPoints', '[]'))
        print("Parsed rawPoints:", raw_points)
        trail_segments = json.loads(data.get('trailSegments', '[]'))
        print("Parsed trailSegments:", trail_segments)

        # Handle multiple images
        trail_images = request.FILES.getlist('trail_images')  # <-- GET MULTIPLE FILES from same key

        uploaded_trail_images = []

        for img in trail_images:
            image_instance = TrailImage.objects.create(image=img)
            uploaded_trail_images.append(image_instance)
            print(f"Saved trail image: {image_instance}")

        # Create the Trail object
        trail = Trail.objects.create(
            created_by=request.user if request.user.is_authenticated else None,
            name=data.get('name'),
            type=data.get('type'),
            location=data.get('location'),
            difficulty=data.get('difficulty'),
            description=data.get('description'),
            distance_km=data.get('distance_km'),
            highest_altitude=data.get('highest_altitude'),
            checklist=checklist,
            is_approved=False  # New trails are NOT approved initially
        )
        print("Trail created:", trail)

        # Add images to trail (ManyToManyField)
        trail.images.set(uploaded_trail_images)  # Assign the images to the trail (using set() for many-to-many relationships)

        # First, map uploaded waypoint images by filename
        waypoint_uploaded_files = request.FILES.getlist('waypoint_images')
        waypoint_file_mapping = {file.name: file for file in waypoint_uploaded_files}

        # Now process points
        for point in raw_points:
            waypoint_images = []

            for image_filename in point.get('images', []):
                image_file = waypoint_file_mapping.get(image_filename)
                if image_file:
                    waypoint_image = WaypointImage.objects.create(image=image_file)
                    waypoint_images.append(waypoint_image)

            waypoint = Waypoint.objects.create(
                trail=trail,
                name=point.get('name', ''),
                description=point.get('description', ''),
                latitude=point['latitude'],
                longitude=point['longitude'],
            )
            waypoint.images.set(waypoint_images)
            print("Created waypoint:", point)



        # Create Trail Segments
        for seg in trail_segments:
            TrailSegment.objects.create(
                trail=trail,
                routed=seg.get('routed', True),
                points=seg.get('points', [])
            )
            print("Created trail segment:", seg)

        return Response({"message": "Trail created successfully, pending admin approval."}, status=status.HTTP_201_CREATED)

# List only approved Trails
class TrailListView(generics.ListAPIView):
    serializer_class = TrailSerializer

    def get_queryset(self):
        print("Fetching approved trails")
        return Trail.objects.filter(is_approved=True)

# Get single Trail detail (with segments, waypoints, offline maps, reviews)
class TrailDetailView(generics.RetrieveAPIView):
    queryset = Trail.objects.all()
    serializer_class = TrailSerializer
    lookup_field = 'id'

    def get(self, request, *args, **kwargs):
        trail = self.get_object()
        print("Fetched Trail details for:", trail)
        return super().get(request, *args, **kwargs)

# Add Waypoints to a Trail
class WaypointCreateView(generics.CreateAPIView):
    serializer_class = WaypointSerializer

    def post(self, request, trail_id):
        print(f"Adding waypoints to trail {trail_id}")
        trail = Trail.objects.get(id=trail_id)
        data = request.data
        waypoints_data = data.get('waypoints', [])
        print("Received waypoints data:", waypoints_data)

        for point in waypoints_data:
            waypoint_images = []
            # Handle waypoint images
            for image in point.get('images', []):
                waypoint_image = WaypointImage.objects.create(image=image)  # Save the waypoint image
                waypoint_images.append(waypoint_image)

            waypoint = Waypoint.objects.create(
                trail=trail,
                name=point.get('name', ''),
                description=point.get('description', ''),
                latitude=point['latitude'],
                longitude=point['longitude'],
            )
            waypoint.images.set(waypoint_images)  # Associate images with the waypoint
            print("Created waypoint:", point)

        return Response({"message": "Waypoints added successfully"}, status=status.HTTP_201_CREATED)

# Upload Offline Map file for a Trail
class OfflineMapUploadView(generics.CreateAPIView):
    serializer_class = OfflineMapSerializer
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, trail_id):
        print(f"Uploading offline map for trail {trail_id}")
        trail = Trail.objects.get(id=trail_id)
        file = request.FILES.get('file')
        map_type = request.data.get('map_type', 'GeoJSON')
        print("Received offline map:", file.name)
        print("Map type:", map_type)

        OfflineMap.objects.create(
            trail=trail,
            file=file,
            map_type=map_type
        )

        return Response({"message": "Offline map uploaded successfully"}, status=status.HTTP_201_CREATED)

# Add Review for a Trail
class TrailReviewCreateView(generics.CreateAPIView):
    serializer_class = TrailReviewSerializer

    def post(self, request, trail_id):
        print(f"Adding review for trail {trail_id}")
        trail = Trail.objects.get(id=trail_id)
        data = request.data
        print("Received review data:", data)

        review = TrailReview.objects.create(
            trail=trail,
            written_by=request.user if request.user.is_authenticated else None,
            rating=data.get('rating'),
            comment=data.get('comment', '')
        )

        return Response({"message": "Review added successfully"}, status=status.HTTP_201_CREATED)
