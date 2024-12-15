from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenRefreshView,
    TokenVerifyView
)
from accounts.views import (
    CustomTokenObtainPairView, 
    UserRegistrationView, 
    UserProfileView, 
    UserLogoutView
)
from drf_spectacular.views import (
    SpectacularAPIView, 
    SpectacularSwaggerView, 
    SpectacularRedocView
)
from django.contrib.auth import views as auth_views
from django.shortcuts import redirect

def redirect_to_docs(request):
    return redirect('swagger-ui')

urlpatterns = [
    # Root URL redirects to API docs
    path('', redirect_to_docs, name='root'),

    # Admin site
    path('admin/', admin.site.urls),

    # Authentication URLs
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('api/register/', UserRegistrationView.as_view(), name='user_register'),
    path('api/profile/', UserProfileView.as_view(), name='user_profile'),
    path('api/logout/', UserLogoutView.as_view(), name='user_logout'),

    # API Schema and Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),

    # App-specific URLs
    path('', include('dashboard.urls')),  # Include dashboard URLs at root
    path('accounts/', include('accounts.urls')),
    path('api/mining-operations/', include('mining_operations.urls')),

    # Password Reset URLs
    path('api/password_reset/', 
         auth_views.PasswordResetView.as_view(
             template_name='password_reset.html',
             email_template_name='password_reset_email.html',
             subject_template_name='password_reset_subject.txt'
         ), 
         name='password_reset'),
    path('api/password_reset/done/', 
         auth_views.PasswordResetDoneView.as_view(
             template_name='password_reset_done.html'
         ), 
         name='password_reset_done'),
    path('api/reset/<uidb64>/<token>/', 
         auth_views.PasswordResetConfirmView.as_view(
             template_name='password_reset_confirm.html'
         ), 
         name='password_reset_confirm'),
    path('api/reset/done/', 
         auth_views.PasswordResetCompleteView.as_view(
             template_name='password_reset_complete.html'
         ), 
         name='password_reset_complete'),
]
