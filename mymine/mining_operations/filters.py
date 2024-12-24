import django_filters
from .models import Equipment

class EquipmentFilter(django_filters.FilterSet):
    """Filter for Equipment model."""
    name = django_filters.CharFilter(lookup_expr='icontains')
    status = django_filters.CharFilter(lookup_expr='iexact')
    next_service_date_before = django_filters.DateFilter(field_name='next_service_date', lookup_expr='lte')
    next_service_date_after = django_filters.DateFilter(field_name='next_service_date', lookup_expr='gte')

    class Meta:
        model = Equipment
        fields = ['name', 'status', 'next_service_date_before', 'next_service_date_after']
