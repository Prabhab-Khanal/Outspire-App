from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .models import  SOSAlert
from .serializers import  SOSAlertSerializer
from django.shortcuts import get_object_or_404



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




