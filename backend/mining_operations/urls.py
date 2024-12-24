from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EquipmentViewSet, EquipmentRunningTimeViewSet

router = DefaultRouter()
router.register(r'equipment', EquipmentViewSet)
router.register(r'equipment-running-times', EquipmentRunningTimeViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
