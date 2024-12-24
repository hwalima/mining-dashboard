from django.urls import path
from . import views

urlpatterns = [
    # Dashboard endpoints
    path('dashboard-data/', views.dashboard_data, name='dashboard_data'),
    path('dashboard-data-dev/', views.dashboard_data_dev, name='dashboard_data_dev'),
    
    # Energy endpoints
    path('energy-usage/', views.energy_usage, name='energy_usage'),
    path('energy-usage/<int:id>/', views.energy_usage_detail, name='energy_usage_detail'),
    path('energy-usage/create/', views.create_energy_usage, name='create_energy_usage'),
    path('energy-usage/update/', views.update_energy_usage, name='update_energy_usage'),
    path('energy-usage/delete/<int:id>/', views.delete_energy_usage, name='delete_energy_usage'),
    
    # Labor metrics endpoints
    path('api/labor-metrics/', views.labor_metrics, name='labor_metrics'),
    path('api/labor-metrics/<int:id>/', views.labor_metrics_detail, name='labor_metrics_detail'),
    
    # Explosives endpoints
    path('api/explosives/', views.explosives_usage, name='explosives_usage'),
    path('api/explosives/<int:id>/', views.explosives_usage_detail, name='explosives_usage_detail'),
    
    # Gold production endpoints
    path('gold-production/', views.gold_production, name='gold_production'),
    path('gold-production/<int:id>/', views.gold_production_detail, name='gold_production_detail'),
    path('gold-production/create/', views.create_gold_production, name='create_gold_production'),
    path('gold-production/update/', views.update_gold_production, name='update_gold_production'),
    path('gold-production/delete/<str:date>/', views.delete_gold_production, name='delete_gold_production'),
    
    # Safety endpoints
    path('safety/', views.safety_incidents, name='safety_incidents'),
    path('safety/<int:id>/', views.safety_incident_detail, name='safety_incident_detail'),
    
    # Chemicals endpoints
    path('chemicals-usage/', views.chemicals_usage, name='chemicals_usage'),
    path('chemicals-usage/<int:id>/', views.chemicals_usage_detail, name='chemicals_usage_detail'),
    
    # Departments endpoints
    path('get_departments/', views.get_departments, name='get_departments'),
    path('departments/', views.create_department, name='create_department'),
    path('departments/<int:id>/', views.update_department, name='update_department'),
    path('departments/<int:id>/delete/', views.delete_department, name='delete_department'),
]
