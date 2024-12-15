from rest_framework import serializers
from .models import (
    ExplosivesInventory, StockpileVolume,
    LaborMetric, EnvironmentalMetric
)

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
