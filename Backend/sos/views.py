from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .models import EmergencyContact, SOSAlert
from .serializers import EmergencyContactSerializer, SOSAlertSerializer
from django.shortcuts import get_object_or_404

class EmergencyContactListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        contacts = EmergencyContact.objects.filter(user=request.user)
        serializer = EmergencyContactSerializer(contacts, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = EmergencyContactSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class EmergencyContactDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        contact = get_object_or_404(EmergencyContact, pk=pk, user=request.user)
        contact.delete()
        return Response({'message': 'Contact deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)


class SOSAlertCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = SOSAlertSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response({'message': 'SOS logged successfully.'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SOSAlertListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        alerts = SOSAlert.objects.filter(user=request.user).order_by('-timestamp')
        serializer = SOSAlertSerializer(alerts, many=True)
        return Response(serializer.data)




