from django.urls import path
from . import views

app_name = 'dashboard'

urlpatterns = [
    # API endpoints with consistent /api/ prefix
    path('api/daily-logs/', views.get_daily_logs, name='daily_logs'),
    path('api/machinery-status/', views.get_machinery_status, name='machinery_status'),
    path('api/chemical-inventory/', views.get_chemical_inventory, name='chemical_inventory'),
    path('api/chemicals-usage/', views.get_chemicals_usage, name='chemicals_usage'),
    path('api/safety-incidents/', views.get_safety_incidents, name='safety_incidents'),
    path('api/energy-usage/', views.get_energy_usage, name='energy_usage'),
    path('api/equipment-status/', views.get_equipment_status, name='equipment_status'),
    path('api/gold-production/', views.get_gold_production, name='gold_production'),
    path('api/explosives-data/', views.get_explosives_data, name='explosives_data'),
    path('api/labor-metrics/', views.get_labor_metrics, name='labor_metrics'),
    path('api/environmental-metrics/', views.get_environmental_metrics, name='environmental_metrics'),
]
