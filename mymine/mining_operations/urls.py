from django.urls import path
from . import views

urlpatterns = [
    # Add mining operations related URLs here
    path('dashboard-data/', views.dashboard_data_dev, name='dashboard_data'),
    path('energy-usage/', views.energy_usage, name='energy_usage'),
    path('chemicals-usage/', views.chemicals_usage, name='chemicals_usage'),
    path('gold-production/', views.gold_production, name='gold_production'),
    path('equipment-maintenance/', views.equipment_maintenance, name='equipment_maintenance'),
]
