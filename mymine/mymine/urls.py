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
from rest_framework import routers
from dashboard.views import (
    ChemicalViewSet,
    ChemicalUsageViewSet,
)

def redirect_to_docs(request):
    return redirect('swagger-ui')

router = routers.DefaultRouter()
router.register(r'chemicals', ChemicalViewSet)
router.register(r'chemical-usage', ChemicalUsageViewSet)

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

    # Include mining_operations URLs
    path('api/mining-operations/', include('mining_operations.urls')),
    path('api/dashboard/', include('dashboard.urls')),
    
    # Include router URLs
    path('api/', include(router.urls)),
]
