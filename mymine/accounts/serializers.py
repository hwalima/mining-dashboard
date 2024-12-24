from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

User = get_user_model()

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom token serializer to include additional user information
    """
    username_field = 'email'

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        # Add custom claims
        token['email'] = user.email
        token['role'] = user.role
        
        return token

class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration
    """
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    confirm_password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ('email', 'password', 'confirm_password', 'role')
        extra_kwargs = {
            'email': {'required': True},
        }

    def validate(self, data):
        """
        Validate password and confirm_password match
        """
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords must match."})
        
        # Validate password
        validate_password(data['password'])
        return data

    def create(self, validated_data):
        """
        Create and return a new user instance
        """
        validated_data.pop('confirm_password')
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            role=validated_data.get('role', 'operator')
        )
        return user

class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for user profile details
    """
    class Meta:
        model = User
        fields = ('id', 'email', 'role', 'last_login', 'date_joined')
        read_only_fields = ('id', 'last_login', 'date_joined')
