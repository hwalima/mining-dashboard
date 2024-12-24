from rest_framework import serializers
from .models import (
    ExplosivesInventory, StockpileVolume,
    LaborMetric, EnvironmentalMetric, MiningDepartment,
    MiningEquipment, MiningChemical, Equipment
)

class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = MiningDepartment
        fields = ['id', 'name', 'type', 'description', 'created_at', 'updated_at']

class ExplosivesInventorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ExplosivesInventory
        fields = '__all__'

class StockpileVolumeSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockpileVolume
        fields = '__all__'

class LaborMetricSerializer(serializers.ModelSerializer):
    class Meta:
        model = LaborMetric
        fields = ['date', 'shift', 'workers_present', 'hours_worked', 
                 'overtime_hours', 'productivity_index', 'safety_incidents']

class EnvironmentalMetricSerializer(serializers.ModelSerializer):
    class Meta:
        model = EnvironmentalMetric
        fields = '__all__'

class MiningEquipmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = MiningEquipment
        fields = [
            'id', 'name', 'description', 'value_usd',
            'last_service_date', 'next_service_date',
            'service_interval_days', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

class EquipmentSerializer(serializers.ModelSerializer):
    """
    Serializer for mining equipment from the settings page
    """
    department = DepartmentSerializer(read_only=True)
    department_id = serializers.PrimaryKeyRelatedField(
        queryset=MiningDepartment.objects.all(),
        source='department',
        allow_null=True,
        required=False,
        write_only=True
    )
    service_status = serializers.SerializerMethodField()
    days_since_last_service = serializers.SerializerMethodField()
    days_until_next_service = serializers.SerializerMethodField()

    def get_service_status(self, obj):
        return obj.get_service_status()

    def get_days_since_last_service(self, obj):
        return obj.get_days_since_last_service()

    def get_days_until_next_service(self, obj):
        return obj.get_days_until_next_service()

    class Meta:
        model = Equipment
        fields = [
            'id', 'name', 'description', 'department',
            'department_id', 'last_service_date', 'next_service_date',
            'service_interval_days', 'service_status',
            'days_since_last_service', 'days_until_next_service',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'next_service_date']

class ChemicalSerializer(serializers.ModelSerializer):
    """
    Serializer for mining chemicals
    """
    class Meta:
        model = MiningChemical
        fields = '__all__'
