from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from .models import Trail

User = get_user_model()

class TrailViewTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='Test@1234',
            phone_number='9800000000',  # ✅ REQUIRED FIELD
            first_name='Test',
            last_name='User',
        )
        self.client.force_authenticate(user=self.user)

        self.trail_data = {
            'name': 'Sample Trail',
            'type': 'Hiking',
            'location': 'Test Valley',
            'difficulty': 'Moderate',
            'description': 'A test trail',
            'distance_km': 12.5,
            'highest_altitude': 2100,
            'checklist': '[]',
            'rawPoints': '[]',
            'trailSegments': '[]'
        }

    def test_create_trail(self):
        url = reverse('trail-create')  # Make sure this name exists in your urls.py
        response = self.client.post(url, self.trail_data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        print("✅ Trail creation test passed")

    def test_list_approved_trails(self):
        Trail.objects.create(name='Approved Trail', location='X', type='Hiking', difficulty='Easy',
                             description='desc', distance_km=1, highest_altitude=1, is_approved=True)
        url = reverse('trail-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        print("✅ Trail list test passed")

    def test_get_trail_detail(self):
        trail = Trail.objects.create(name='Detail Trail', location='Y', type='Hiking', difficulty='Hard',
                                     description='desc', distance_km=1, highest_altitude=1, is_approved=True)
        url = reverse('trail-detail', kwargs={'id': trail.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        print("✅ Trail detail test passed")

    def test_add_waypoints(self):
        trail = Trail.objects.create(name='Trail WP', location='Z', type='Trekking', difficulty='Easy',
                                    description='desc', distance_km=1, highest_altitude=1, is_approved=True)
        url = reverse('waypoint-create', kwargs={'trail_id': trail.id})
        waypoint_payload = {
            'waypoints': [
                {
                    'name': 'Point A',
                    'description': 'Desc',
                    'latitude': 27.0,
                    'longitude': 85.0,
                    'images': []
                }
            ]
        }
        response = self.client.post(url, waypoint_payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        print("✅ Add waypoint test passed")

    def test_add_review(self):
        trail = Trail.objects.create(name='Review Trail', location='K', type='Hiking', difficulty='Moderate',
                                    description='desc', distance_km=2, highest_altitude=2000, is_approved=True)
        url = reverse('trail-review-create', kwargs={'trail_id': trail.id})
        response = self.client.post(url, {'rating': 4, 'comment': 'Nice trail!'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        print("✅ Add trail review test passed")
