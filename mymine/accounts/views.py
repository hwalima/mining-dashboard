from django.shortcuts import render
from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import CreateAPIView, RetrieveUpdateAPIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

from .serializers import (
    CustomTokenObtainPairSerializer, 
    UserRegistrationSerializer, 
    UserProfileSerializer
)
from django.contrib.auth import get_user_model

User = get_user_model()

class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Custom token obtain view to provide additional user context
    """
    serializer_class = CustomTokenObtainPairSerializer

class UserRegistrationView(CreateAPIView):
    """
    User registration view
    Allows creating new user accounts with role-based access
    """
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate tokens manually
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserProfileSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token)
        }, status=status.HTTP_201_CREATED)

class UserProfileView(RetrieveUpdateAPIView):
    """
    User profile retrieval and update view
    """
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

class UserLogoutView(APIView):
    """
    View for user logout
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserProfileSerializer  

    def post(self, request):
        """
        Logout user and blacklist refresh token
        """
        try:
            refresh_token = request.data.get('refresh_token')
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"detail": "Successfully logged out."}, status=status.HTTP_200_OK)
        except TokenError:
            return Response({"detail": "Invalid token."}, status=status.HTTP_400_BAD_REQUEST)
