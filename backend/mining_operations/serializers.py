from rest_framework import serializers
from .models import Equipment, EquipmentRunningTime

class EquipmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Equipment
        fields = '__all__'

class EquipmentRunningTimeSerializer(serializers.ModelSerializer):
    equipment_name = serializers.CharField(source='equipment.name', read_only=True)

    class Meta:
        model = EquipmentRunningTime
        fields = ['id', 'date', 'equipment', 'equipment_name', 'total_running_hours', 'remarks']
        
    def validate_unique_together(self, attrs):
        # Check if there's already a record for this equipment on this date
        qs = EquipmentRunningTime.objects.filter(
            date=attrs['date'],
            equipment=attrs['equipment']
        )
        
        # If we're updating, exclude the current instance
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
            
        if qs.exists():
            raise serializers.ValidationError(
                "A running time record already exists for this equipment on this date."
            )
        return attrs

    def validate(self, data):
        # Call the unique together validation
        self.validate_unique_together(data)
        return data
