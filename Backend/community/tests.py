from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from community.models import Post

User = get_user_model()

class PostTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='postuser',
            email='postuser@example.com',
            password='Test@1234',
            phone_number='9800000000',
            is_email_verified=True
        )
        self.client.force_authenticate(user=self.user)

    def test_create_post(self):
        url = reverse('post-create')
        data = {
            "caption": "A beautiful hike",
            "location": "Annapurna Base Camp"
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        print("Passed: Post creation test passed")

    def test_list_posts(self):
        Post.objects.create(user=self.user, caption="Test post", location="Kathmandu")
        url = reverse('post-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        print("Passed: Post listing test passed")

    def test_get_single_post(self):
        post = Post.objects.create(user=self.user, caption="Test post", location="Kathmandu")
        url = reverse('get_single_post', kwargs={'post_id': post.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        print("Passed: Get single post test passed")

    def test_upload_post_images_without_image(self):
        post = Post.objects.create(user=self.user, caption="Post without images", location="Everest")
        url = reverse('post-image-upload', kwargs={'post_id': post.id})
        response = self.client.post(url, {})  # no images
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        print("Passed: Upload without images test passed")

    def test_upload_post_images_unauthorized(self):
        another_user = User.objects.create_user(
            username='notowner',
            email='notowner@example.com',
            password='Test@1234',
            phone_number='9800000001'
        )
        post = Post.objects.create(user=another_user, caption="Someone else's post", location="Lukla")
        url = reverse('post-image-upload', kwargs={'post_id': post.id})
        response = self.client.post(url, {})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        print("Passed: Upload images to unauthorized post test passed")
