from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from django_filters import rest_framework as filters
from .models import Equipment, EquipmentRunningTime
from .serializers import EquipmentSerializer, EquipmentRunningTimeSerializer

class EquipmentFilter(filters.FilterSet):
    class Meta:
        model = Equipment
        fields = {
            'name': ['exact', 'icontains'],
            'next_service_date': ['exact', 'gte', 'lte'],
        }

class EquipmentRunningTimeFilter(filters.FilterSet):
    date_from = filters.DateFilter(field_name='date', lookup_expr='gte')
    date_to = filters.DateFilter(field_name='date', lookup_expr='lte')
    equipment_name = filters.CharFilter(field_name='equipment__name', lookup_expr='icontains')

    class Meta:
        model = EquipmentRunningTime
        fields = ['equipment', 'date', 'date_from', 'date_to', 'equipment_name']

class EquipmentViewSet(viewsets.ModelViewSet):
    queryset = Equipment.objects.all()
    serializer_class = EquipmentSerializer
    permission_classes = [IsAuthenticated]
    filterset_class = EquipmentFilter

class EquipmentRunningTimeViewSet(viewsets.ModelViewSet):
    queryset = EquipmentRunningTime.objects.all().select_related('equipment')
    serializer_class = EquipmentRunningTimeSerializer
    permission_classes = [IsAuthenticated]
    filterset_class = EquipmentRunningTimeFilter
    
    def get_queryset(self):
        return super().get_queryset().order_by('-date', 'equipment__name')
