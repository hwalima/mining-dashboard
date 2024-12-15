from django.urls import path
from .views import UserProfileView

urlpatterns = [
    # Additional account-related URLs can be added here
    path('profile/', UserProfileView.as_view(), name='user_profile'),
]
