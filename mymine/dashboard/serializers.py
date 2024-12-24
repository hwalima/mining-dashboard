from rest_framework import serializers
from .models import ChemicalInventory, ChemicalUsage

class ChemicalInventorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ChemicalInventory
        fields = ['id', 'name', 'unit', 'current_stock', 'minimum_required', 'unit_price']

class ChemicalUsageSerializer(serializers.ModelSerializer):
    chemical = ChemicalInventorySerializer(read_only=True)
    chemical_id = serializers.PrimaryKeyRelatedField(
        queryset=ChemicalInventory.objects.all(),
        source='chemical',
        write_only=True
    )

    class Meta:
        model = ChemicalUsage
        fields = ['id', 'date', 'chemical', 'chemical_id', 'amount_used', 'process', 'notes']
        read_only_fields = ['id']

    def create(self, validated_data):
        # Update the chemical inventory when creating a usage record
        chemical = validated_data['chemical']
        amount_used = validated_data['amount_used']
        
        # Decrease the current stock
        chemical.current_stock = chemical.current_stock - amount_used
        chemical.save()
        
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # Update the chemical inventory when updating a usage record
        if 'chemical' in validated_data or 'amount_used' in validated_data:
            old_amount = instance.amount_used
            new_amount = validated_data.get('amount_used', old_amount)
            old_chemical = instance.chemical
            new_chemical = validated_data.get('chemical', old_chemical)
            
            # Restore the old amount to the old chemical's stock
            old_chemical.current_stock = old_chemical.current_stock + old_amount
            old_chemical.save()
            
            # Decrease the new amount from the new chemical's stock
            new_chemical.current_stock = new_chemical.current_stock - new_amount
            new_chemical.save()
        
        return super().update(instance, validated_data)
