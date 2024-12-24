from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from datetime import datetime, timedelta
from decimal import Decimal
from .models import DailyProductionLog, EnergyUsage, SafetyIncident, MiningDepartment
import logging

logger = logging.getLogger(__name__)

@api_view(['GET'])
def dashboard_data(request):
    """Get dashboard data for the specified date range."""
    try:
        from_date = request.GET.get('from_date')
        to_date = request.GET.get('to_date')

        logger.info(f"Fetching dashboard data for date range: {from_date} to {to_date}")

        # Convert dates to datetime objects
        from_date = datetime.strptime(from_date, '%Y-%m-%d').date()
        to_date = datetime.strptime(to_date, '%Y-%m-%d').date()

        # Placeholder data for testing
        data = {
            "chemicals": {
                "total_chemicals": 5,
                "low_stock_count": 1,
                "warning_stock_count": 2,
                "total_value_used": 150000.00,
                "data": [
                    {
                        "name": "Activated Carbon",
                        "amount_used": 500.0,
                        "unit": "kg",
                        "value_used": 50000.00,
                        "current_stock": 1000.0,
                        "avg_daily_usage": 71.43,
                        "status": "Normal"
                    },
                    {
                        "name": "Sodium Cyanide",
                        "amount_used": 300.0,
                        "unit": "kg",
                        "value_used": 45000.00,
                        "current_stock": 200.0,
                        "avg_daily_usage": 42.86,
                        "status": "Warning"
                    },
                    {
                        "name": "Lime",
                        "amount_used": 400.0,
                        "unit": "kg",
                        "value_used": 20000.00,
                        "current_stock": 100.0,
                        "avg_daily_usage": 57.14,
                        "status": "Low"
                    },
                    {
                        "name": "Hydrochloric Acid",
                        "amount_used": 200.0,
                        "unit": "L",
                        "value_used": 15000.00,
                        "current_stock": 500.0,
                        "avg_daily_usage": 28.57,
                        "status": "Normal"
                    },
                    {
                        "name": "Sulfuric Acid",
                        "amount_used": 250.0,
                        "unit": "L",
                        "value_used": 20000.00,
                        "current_stock": 300.0,
                        "avg_daily_usage": 35.71,
                        "status": "Warning"
                    }
                ]
            },
            "energy": {
                "total_electricity_kwh": 25000,
                "total_diesel_liters": 15000,
                "total_cost": 75000,
                "avg_daily_consumption": 3571.43,
                "peak_demand": 4200,
                "data": [
                    {
                        "date": "2024-12-23",
                        "electricity_kwh": 12000,
                        "diesel_liters": 7000,
                        "cost": 35000
                    },
                    {
                        "date": "2024-12-24", 
                        "electricity_kwh": 13000,
                        "diesel_liters": 8000,
                        "cost": 40000
                    }
                ]
            },
            "gold_production": {
                "summary": {
                    "total_production": 12.5,
                    "total_value": 750000,
                    "avg_daily_production": 1.79,
                    "recovery_rate": 92.5
                },
                "data": [
                    {
                        "date": "2024-12-23",
                        "production": 6.2,
                        "value": 372000,
                        "recovery_rate": 92.1
                    },
                    {
                        "date": "2024-12-24",
                        "production": 6.3,
                        "value": 378000,
                        "recovery_rate": 92.9
                    }
                ]
            }
        }

        return Response(data)
    except Exception as e:
        logger.error(f"Error fetching dashboard data: {str(e)}")
        return Response(
            {"error": f"Error fetching dashboard data: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
def dashboard_data_dev(request):
    """Development endpoint that returns static data."""
    data = {
        "chemicals": {
            "total_chemicals": 5,
            "low_stock_count": 1,
            "warning_stock_count": 2,
            "total_value_used": 150000.00,
            "data": [
                {
                    "name": "Activated Carbon",
                    "amount_used": 500.0,
                    "unit": "kg",
                    "value_used": 50000.00,
                    "current_stock": 1000.0,
                    "avg_daily_usage": 71.43,
                    "status": "Normal"
                },
                {
                    "name": "Sodium Cyanide",
                    "amount_used": 300.0,
                    "unit": "kg",
                    "value_used": 45000.00,
                    "current_stock": 200.0,
                    "avg_daily_usage": 42.86,
                    "status": "Warning"
                }
            ]
        }
    }
    return Response(data)

@api_view(['GET'])
def energy_usage(request):
    """Get energy usage records within a date range."""
    try:
        from_date = request.GET.get('from_date')
        to_date = request.GET.get('to_date')
        
        print(f"Fetching energy usage from {from_date} to {to_date}")  # Debug log
        
        queryset = EnergyUsage.objects.all()
        
        if from_date:
            queryset = queryset.filter(date__gte=from_date)
        if to_date:
            queryset = queryset.filter(date__lte=to_date)
            
        queryset = queryset.order_by('-date')
        
        data = {
            "data": [
                {
                    "id": log.id,
                    "date": log.date.strftime('%Y-%m-%d'),
                    "electricity_kwh": float(log.electricity_kwh),
                    "electricity_cost": float(log.electricity_cost),
                    "diesel_liters": float(log.diesel_liters),
                    "diesel_cost": float(log.diesel_cost),
                    "total_cost": float(log.total_cost),
                    "notes": log.notes if log.notes else ""
                }
                for log in queryset
            ],
            "summary": {
                "avg_electricity_kwh": float(sum(log.electricity_kwh for log in queryset) / len(queryset)) if queryset else 0,
                "avg_electricity_cost": float(sum(log.electricity_cost for log in queryset) / len(queryset)) if queryset else 0,
                "avg_diesel_liters": float(sum(log.diesel_liters for log in queryset) / len(queryset)) if queryset else 0,
                "avg_diesel_cost": float(sum(log.diesel_cost for log in queryset) / len(queryset)) if queryset else 0,
                "avg_total_cost": float(sum(log.total_cost for log in queryset) / len(queryset)) if queryset else 0,
                "trend_electricity": 0,
                "trend_diesel": 0,
                "trend_cost": 0
            }
        }
        return Response(data)
        
    except Exception as e:
        logger.error(f"Error fetching energy usage records: {str(e)}")
        return Response(
            {"error": f"Error fetching records: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
def energy_usage_detail(request, id):
    """Get detailed energy usage data for a specific record."""
    try:
        record = EnergyUsage.objects.get(id=id)
        data = {
            "id": record.id,
            "date": record.date.strftime('%Y-%m-%d'),
            "electricity_kwh": float(record.electricity_kwh),
            "electricity_cost": float(record.electricity_cost),
            "diesel_liters": float(record.diesel_liters),
            "diesel_cost": float(record.diesel_cost),
            "total_cost": float(record.total_cost),
            "notes": record.notes if record.notes else ""
        }
        return Response(data)
    except EnergyUsage.DoesNotExist:
        return Response(
            {"error": "Energy usage record not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Error fetching energy usage detail: {str(e)}")
        return Response(
            {"error": f"Error fetching energy usage detail: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
def create_energy_usage(request):
    """Create a new energy usage record."""
    try:
        data = request.data
        logger.info(f"Creating energy usage record with data: {data}")  # Debug log
        
        # Check if record already exists for this date
        existing_record = EnergyUsage.objects.filter(date=data['date']).first()
        if existing_record:
            return Response(
                {"error": f"A record already exists for date {data['date']}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        record = EnergyUsage.objects.create(
            date=data['date'],
            electricity_kwh=data['electricity_kwh'],
            electricity_cost=data['electricity_cost'],
            diesel_liters=data['diesel_liters'],
            diesel_cost=data['diesel_cost'],
            total_cost=data['total_cost'],
            notes=data.get('notes', '')
        )
        return Response({
            "message": "Record created successfully",
            "id": record.id,
            "date": record.date.strftime('%Y-%m-%d')
        })
    except Exception as e:
        logger.error(f"Error creating energy usage record: {str(e)}")
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['PUT'])
def update_energy_usage(request):
    """Update an existing energy usage record."""
    try:
        data = request.data
        print("Received data:", data)  # Debug log
        
        if 'id' not in data:
            return Response(
                {"error": "Record ID is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        record = EnergyUsage.objects.get(id=data['id'])
        
        # Validate numeric fields
        try:
            electricity_kwh = float(data['electricity_kwh'])
            electricity_cost = float(data['electricity_cost'])
            diesel_liters = float(data['diesel_liters'])
            diesel_cost = float(data['diesel_cost'])
            total_cost = float(data['total_cost'])
            
            # Validate non-negative values
            if any(val < 0 for val in [electricity_kwh, electricity_cost, diesel_liters, diesel_cost, total_cost]):
                raise ValueError("All numeric values must be non-negative")
                
        except (ValueError, TypeError) as e:
            return Response(
                {"error": f"Invalid numeric value: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update fields
        record.electricity_kwh = electricity_kwh
        record.electricity_cost = electricity_cost
        record.diesel_liters = diesel_liters
        record.diesel_cost = diesel_cost
        record.total_cost = total_cost
        record.notes = data.get('notes', record.notes)
        
        record.save()
        
        return Response({
            "message": "Record updated successfully",
            "id": record.id,
            "date": record.date.strftime('%Y-%m-%d'),
            "updated_values": {
                "electricity_kwh": electricity_kwh,
                "electricity_cost": electricity_cost,
                "diesel_liters": diesel_liters,
                "diesel_cost": diesel_cost,
                "total_cost": total_cost
            }
        })
    except EnergyUsage.DoesNotExist:
        return Response(
            {"error": "Record not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Error updating energy usage record: {str(e)}")
        return Response(
            {"error": f"Error updating record: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['DELETE'])
def delete_energy_usage(request, id):
    """Delete an energy usage record."""
    try:
        print("Deleting record with ID:", id)  # Debug log
        record = EnergyUsage.objects.get(id=id)
        record.delete()
        
        return Response({
            "message": "Record deleted successfully",
            "id": id
        })
    except EnergyUsage.DoesNotExist:
        return Response(
            {"error": "Record not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Error deleting energy usage record: {str(e)}")
        return Response(
            {"error": f"Error deleting record: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
def labor_metrics(request):
    """Get labor metrics data."""
    try:
        from_date = request.query_params.get('from_date')
        to_date = request.query_params.get('to_date')

        # Placeholder data
        data = {
            "summary": {
                "total_hours": 2400,
                "total_workers": 120,
                "avg_hours_per_worker": 20,
                "productivity_rate": 0.85
            },
            "daily_data": [
                {
                    "date": "2024-12-23",
                    "hours_worked": 800,
                    "workers": 120,
                    "productivity": 0.84
                },
                {
                    "date": "2024-12-24",
                    "hours_worked": 780,
                    "workers": 115,
                    "productivity": 0.86
                }
            ]
        }
        return Response(data)
    except Exception as e:
        return Response(
            {"error": f"Error fetching labor metrics: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
def explosives_usage(request):
    """Get explosives usage data."""
    try:
        from_date = request.query_params.get('from_date')
        to_date = request.query_params.get('to_date')

        # Placeholder data
        data = {
            "summary": {
                "total_quantity": 5000,  # kg
                "total_cost": 150000,
                "avg_daily_usage": 714.29,
                "efficiency_rate": 0.92
            },
            "daily_data": [
                {
                    "date": "2024-12-23",
                    "quantity": 750,
                    "cost": 22500,
                    "efficiency": 0.91
                },
                {
                    "date": "2024-12-24",
                    "quantity": 720,
                    "cost": 21600,
                    "efficiency": 0.93
                }
            ]
        }
        return Response(data)
    except Exception as e:
        return Response(
            {"error": f"Error fetching explosives data: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
def gold_production(request):
    """Get gold production data."""
    try:
        from_date = request.GET.get('from_date')
        to_date = request.GET.get('to_date')

        # Convert dates to datetime objects
        from_date = datetime.strptime(from_date, '%Y-%m-%d').date()
        to_date = datetime.strptime(to_date, '%Y-%m-%d').date()

        # Query production logs for the date range
        production_logs = list(DailyProductionLog.objects.filter(
            date__gte=from_date,
            date__lte=to_date
        ).order_by('date').values('date', 'gold_price'))  # Order by date ascending and only get needed fields

        # Debug logging for query results
        print(f"Date range: {from_date} to {to_date}")
        print(f"Number of records found: {len(production_logs)}")
        for log in production_logs:
            print(f"Record - Date: {log['date']}, Gold Price: {log['gold_price']}")

        if not production_logs:
            return Response({
                "summary": {
                    "avg_efficiency": 0,
                    "avg_recovery_rate": 0,
                    "avg_gold_price": 0,
                    "total_smelted_gold": 0
                },
                "data": [],
                "tonnage_data": []
            })

        # Calculate summary metrics
        total_smelted = sum(log.smelted_gold for log in DailyProductionLog.objects.filter(date__gte=from_date, date__lte=to_date))
        avg_operational_efficiency = sum(log.operational_efficiency for log in DailyProductionLog.objects.filter(date__gte=from_date, date__lte=to_date)) / len(production_logs)
        avg_recovery_rate = sum(log.gold_recovery_rate for log in DailyProductionLog.objects.filter(date__gte=from_date, date__lte=to_date)) / len(production_logs)
        
        # Debug logging for gold price calculation
        gold_prices = [log['gold_price'] for log in production_logs]
        print(f"Gold prices in range: {gold_prices}")
        avg_gold_price = sum(gold_prices) / len(gold_prices)
        print(f"Calculated average gold price: {avg_gold_price}")

        # Format the data
        data = {
            "summary": {
                "avg_efficiency": float(avg_operational_efficiency),
                "avg_recovery_rate": float(avg_recovery_rate),
                "avg_gold_price": float(avg_gold_price),  # Use average instead of latest price
                "total_smelted_gold": float(total_smelted)
            },
            "data": [
                {
                    "date": log.date.strftime('%Y-%m-%d'),
                    "total_tonnage_crushed": float(log.total_tonnage_crushed),
                    "total_tonnage_hoisted": float(log.total_tonnage_hoisted),
                    "total_tonnage_milled": float(log.total_tonnage_milled),
                    "gold_recovery_rate": float(log.gold_recovery_rate),
                    "operational_efficiency": float(log.operational_efficiency),
                    "smelted_gold": float(log.smelted_gold),
                    "gold_price": float(log.gold_price),
                    "notes": log.notes
                }
                for log in DailyProductionLog.objects.filter(date__gte=from_date, date__lte=to_date)
            ],
            "tonnage_data": [
                {
                    "date": log.date.strftime('%Y-%m-%d'),
                    "crushed": float(log.total_tonnage_crushed),
                    "hoisted": float(log.total_tonnage_hoisted),
                    "milled": float(log.total_tonnage_milled)
                }
                for log in DailyProductionLog.objects.filter(date__gte=from_date, date__lte=to_date)
            ]
        }
        return Response(data)
    except Exception as e:
        logger.error(f"Error in gold_production view: {str(e)}")
        return Response(
            {"error": f"Error fetching gold production data: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
def chemicals_usage(request):
    """Get chemicals usage data."""
    try:
        from_date = request.GET.get('from_date')
        to_date = request.GET.get('to_date')

        # Convert dates to datetime objects
        from_date = datetime.strptime(from_date, '%Y-%m-%d').date()
        to_date = datetime.strptime(to_date, '%Y-%m-%d').date()

        # Placeholder data
        data = {
            "total_chemicals": 5,
            "low_stock_count": 1,
            "warning_stock_count": 2,
            "total_value_used": 150000.00,
            "data": [
                {
                    "name": "Activated Carbon",
                    "amount_used": 500.0,
                    "unit": "kg",
                    "value_used": 50000.00,
                    "current_stock": 1000.0,
                    "avg_daily_usage": 71.43,
                    "status": "Normal"
                },
                {
                    "name": "Sodium Cyanide",
                    "amount_used": 300.0,
                    "unit": "kg",
                    "value_used": 45000.00,
                    "current_stock": 200.0,
                    "avg_daily_usage": 42.86,
                    "status": "Warning"
                }
            ]
        }
        return Response(data)
    except Exception as e:
        return Response(
            {"error": f"Error fetching chemicals usage data: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
def gold_production_detail(request, id):
    """Get detailed gold production data for a specific record."""
    try:
        # Placeholder data
        data = {
            "id": id,
            "date": "2024-12-23",
            "production": 1.8,
            "value": 108000.00,
            "recovery_rate": 92.0,
            "ore_grade": 2.5,
            "throughput": 1000.0,
            "notes": "Normal operation"
        }
        return Response(data)
    except Exception as e:
        return Response(
            {"error": f"Error fetching gold production detail: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
def chemicals_usage_detail(request, id):
    """Get detailed chemicals usage data for a specific record."""
    try:
        # Placeholder data for a specific record
        data = {
            "id": id,
            "date": "2024-12-23",
            "cyanide_kg": 1200,
            "lime_kg": 2500,
            "activated_carbon_kg": 800,
            "flocculant_kg": 150,
            "cost": 45000,
            "notes": "Normal consumption within expected ranges",
            "operator": "John Smith",
            "batch_numbers": {
                "cyanide": "CN-2024-123",
                "lime": "LM-2024-456",
                "activated_carbon": "AC-2024-789",
                "flocculant": "FL-2024-012"
            },
            "quality_checks": [
                {
                    "time": "08:00",
                    "parameter": "pH",
                    "value": 10.5,
                    "status": "Normal"
                },
                {
                    "time": "14:00",
                    "parameter": "pH",
                    "value": 10.3,
                    "status": "Normal"
                }
            ]
        }
        return Response(data)
    except Exception as e:
        return Response(
            {"error": f"Error fetching chemicals usage detail: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
def safety_incidents(request):
    """Get safety incidents data with pagination."""
    try:
        from_date = request.GET.get('from_date')
        to_date = request.GET.get('to_date')
        offset = int(request.GET.get('offset', 0))
        limit = int(request.GET.get('limit', 25))

        # Convert dates to datetime objects
        from_date = datetime.strptime(from_date, '%Y-%m-%d').date()
        to_date = datetime.strptime(to_date, '%Y-%m-%d').date()

        # Fetch actual safety incidents from the database
        queryset = SafetyIncident.objects.filter(
            date__date__range=[from_date, to_date]
        ).order_by('-date')

        total_count = queryset.count()
        paginated_incidents = queryset[offset:offset + limit]

        # Calculate summary statistics
        severity_counts = {
            'low': queryset.filter(severity='low').count(),
            'medium': queryset.filter(severity='medium').count(),
            'high': queryset.filter(severity='high').count(),
            'critical': queryset.filter(severity='critical').count()
        }

        type_counts = {}
        for incident_type in set(queryset.values_list('incident_type', flat=True)):
            type_counts[incident_type] = queryset.filter(incident_type=incident_type).count()

        department_stats = []
        departments = set(queryset.values_list('department__name', flat=True))
        for dept in departments:
            dept_incidents = queryset.filter(department__name=dept)
            department_stats.append({
                'department': dept,
                'total_incidents': dept_incidents.count(),
                'severity_breakdown': {
                    'low': dept_incidents.filter(severity='low').count(),
                    'medium': dept_incidents.filter(severity='medium').count(),
                    'high': dept_incidents.filter(severity='high').count(),
                    'critical': dept_incidents.filter(severity='critical').count()
                },
                'type_breakdown': {
                    incident_type: dept_incidents.filter(incident_type=incident_type).count()
                    for incident_type in set(dept_incidents.values_list('incident_type', flat=True))
                }
            })

        data = {
            "summary": {
                "total_incidents": total_count,
                "severity_counts": severity_counts,
                "type_counts": type_counts,
                "trend_percentage": 0,  # You may want to calculate this based on historical data
                "status_counts": {
                    status: queryset.filter(investigation_status=status).count()
                    for status in set(queryset.values_list('investigation_status', flat=True))
                }
            },
            "total_incidents": total_count,
            "severity_counts": severity_counts,
            "type_counts": type_counts,
            "department_stats": department_stats,
            "recent_incidents": [
                {
                    "id": incident.id,
                    "date": incident.date.strftime('%Y-%m-%d'),  # Fix date formatting
                    "incident_type": incident.incident_type,
                    "severity": incident.severity,
                    "description": incident.description,
                    "department": incident.department.name if incident.department else None,
                    "zone": incident.zone.name if incident.zone else None,
                    "investigation_status": incident.investigation_status,
                    "corrective_actions": incident.corrective_actions
                }
                for incident in paginated_incidents
            ]
        }
        return Response(data)
    except Exception as e:
        return Response(
            {"error": f"Error fetching safety incidents: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
def safety_incident_detail(request, id):
    """Get detailed safety incident data."""
    try:
        # Placeholder data
        data = {
            "id": id,
            "date": "2024-12-23",
            "type": "Near Miss",
            "severity": "Low",
            "location": "Processing Plant",
            "description": "Slip hazard identified near leach tanks",
            "status": "Resolved",
            "actions_taken": "Area cleaned and warning signs installed",
            "reported_by": "John Smith",
            "investigation_details": "Investigation completed on 2024-12-23",
            "corrective_actions": [
                "Clean spill immediately",
                "Install permanent non-slip matting",
                "Update cleaning schedule"
            ],
            "witnesses": ["Jane Doe", "Mike Johnson"],
            "attachments": [
                {
                    "name": "incident_photo.jpg",
                    "url": "/media/safety/incidents/1/photo.jpg",
                    "type": "image/jpeg"
                }
            ]
        }
        return Response(data)
    except Exception as e:
        return Response(
            {"error": f"Error fetching safety incident detail: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
def labor_metrics_detail(request, id):
    """Get detailed labor metrics data for a specific record."""
    try:
        # Placeholder data for a specific record
        data = {
            "id": id,
            "date": "2024-12-23",
            "hours_worked": 800,
            "workers": 120,
            "productivity": 0.84,
            "shifts": [
                {
                    "shift": "Morning",
                    "hours": 280,
                    "workers": 45,
                    "productivity": 0.85
                },
                {
                    "shift": "Afternoon",
                    "hours": 260,
                    "workers": 40,
                    "productivity": 0.83
                },
                {
                    "shift": "Night",
                    "hours": 260,
                    "workers": 35,
                    "productivity": 0.84
                }
            ],
            "departments": [
                {
                    "name": "Mining",
                    "hours": 400,
                    "workers": 60,
                    "productivity": 0.86
                },
                {
                    "name": "Processing",
                    "hours": 300,
                    "workers": 45,
                    "productivity": 0.82
                },
                {
                    "name": "Maintenance",
                    "hours": 100,
                    "workers": 15,
                    "productivity": 0.84
                }
            ]
        }
        return Response(data)
    except Exception as e:
        return Response(
            {"error": f"Error fetching labor metrics detail: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
def explosives_usage_detail(request, id):
    """Get detailed explosives usage data for a specific record."""
    try:
        # Placeholder data for a specific record
        data = {
            "id": id,
            "date": "2024-12-23",
            "quantity": 750,
            "cost": 22500,
            "efficiency": 0.91,
            "locations": [
                {
                    "area": "Pit A",
                    "quantity": 300,
                    "efficiency": 0.92
                },
                {
                    "area": "Pit B",
                    "quantity": 450,
                    "efficiency": 0.90
                }
            ],
            "types": [
                {
                    "name": "ANFO",
                    "quantity": 500,
                    "cost": 15000
                },
                {
                    "name": "Emulsion",
                    "quantity": 250,
                    "cost": 7500
                }
            ],
            "blast_details": {
                "number_of_holes": 45,
                "average_depth": 12,
                "pattern_spacing": 4,
                "rock_fragmentation": "Good"
            }
        }
        return Response(data)
    except Exception as e:
        return Response(
            {"error": f"Error fetching explosives usage detail: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
def create_gold_production(request):
    """Create a new gold production record."""
    try:
        data = request.data
        
        # Convert date string to date object
        date = datetime.strptime(data['date'], '%Y-%m-%d').date()
        
        # Create new record
        record = DailyProductionLog.objects.create(
            date=date,
            total_tonnage_crushed=data['total_tonnage_crushed'],
            total_tonnage_hoisted=data['total_tonnage_hoisted'],
            total_tonnage_milled=data['total_tonnage_milled'],
            gold_recovery_rate=data['gold_recovery_rate'],
            operational_efficiency=data['operational_efficiency'],
            smelted_gold=data['smelted_gold'],
            gold_price=data['gold_price'],
            notes=data.get('notes', '')
        )
        
        return Response({
            "message": "Record created successfully",
            "date": record.date.strftime('%Y-%m-%d')
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        logger.error(f"Error creating gold production record: {str(e)}")
        return Response(
            {"error": f"Error creating record: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['PUT'])
def update_gold_production(request):
    """Update an existing gold production record."""
    try:
        data = request.data
        date = datetime.strptime(data['date'], '%Y-%m-%d').date()
        
        # Get existing record
        record = DailyProductionLog.objects.get(date=date)
        
        # Update fields
        record.total_tonnage_crushed = data['total_tonnage_crushed']
        record.total_tonnage_hoisted = data['total_tonnage_hoisted']
        record.total_tonnage_milled = data['total_tonnage_milled']
        record.gold_recovery_rate = data['gold_recovery_rate']
        record.operational_efficiency = data['operational_efficiency']
        record.smelted_gold = data['smelted_gold']
        record.gold_price = data['gold_price']
        record.notes = data.get('notes', record.notes)
        
        record.save()
        
        return Response({
            "message": "Record updated successfully",
            "date": record.date.strftime('%Y-%m-%d')
        })
    except DailyProductionLog.DoesNotExist:
        return Response(
            {"error": "Record not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Error updating gold production record: {str(e)}")
        return Response(
            {"error": f"Error updating record: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['DELETE'])
def delete_gold_production(request, date):
    """Delete a gold production record."""
    try:
        # Convert date string to date object
        record_date = datetime.strptime(date, '%Y-%m-%d').date()
        
        # Get and delete the record
        record = DailyProductionLog.objects.get(date=record_date)
        record.delete()
        
        return Response({
            "message": "Record deleted successfully",
            "date": date
        })
    except DailyProductionLog.DoesNotExist:
        return Response(
            {"error": "Record not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Error deleting gold production record: {str(e)}")
        return Response(
            {"error": f"Error deleting record: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
def get_departments(request):
    """
    Get all mining departments with their details.
    """
    try:
        from .models import MiningDepartment
        
        # Fetch all departments
        departments = MiningDepartment.objects.all()
        
        # Serialize department data
        department_data = [
            {
                'id': dept.id,
                'name': dept.name,
                'type': dept.type,
                'description': dept.description or '',
                'created_at': dept.created_at.isoformat() if dept.created_at else None,
                'updated_at': dept.updated_at.isoformat() if dept.updated_at else None,
            } for dept in departments
        ]
        
        return Response(department_data)
    except Exception as e:
        logger.error(f"Error fetching departments: {str(e)}")
        return Response({'error': 'Failed to fetch departments'}, status=500)

@api_view(['POST'])
def create_department(request):
    """
    Create a new mining department.
    """
    try:
        from .models import MiningDepartment
        from rest_framework.parsers import JSONParser
        
        data = JSONParser().parse(request)
        
        # Validate required fields
        if not data.get('name'):
            return Response({'error': 'Department name is required'}, status=400)
        
        # Create department
        department = MiningDepartment.objects.create(
            name=data['name'],
            type=data.get('type', 'extraction'),
            description=data.get('description', '')
        )
        
        # Serialize and return the created department
        return Response({
            'id': department.id,
            'name': department.name,
            'type': department.type,
            'description': department.description or '',
            'created_at': department.created_at.isoformat() if department.created_at else None,
            'updated_at': department.updated_at.isoformat() if department.updated_at else None,
        }, status=201)
    except Exception as e:
        logger.error(f"Error creating department: {str(e)}")
        return Response({'error': 'Failed to create department'}, status=500)

@api_view(['PUT'])
def update_department(request, id):
    """
    Update an existing mining department.
    """
    try:
        from .models import MiningDepartment
        from rest_framework.parsers import JSONParser
        
        # Find the department
        try:
            department = MiningDepartment.objects.get(id=id)
        except MiningDepartment.DoesNotExist:
            return Response({'error': 'Department not found'}, status=404)
        
        # Parse and validate data
        data = JSONParser().parse(request)
        
        # Update fields
        if 'name' in data:
            department.name = data['name']
        if 'type' in data:
            department.type = data['type']
        if 'description' in data:
            department.description = data.get('description', '')
        
        department.save()
        
        # Serialize and return the updated department
        return Response({
            'id': department.id,
            'name': department.name,
            'type': department.type,
            'description': department.description or '',
            'created_at': department.created_at.isoformat() if department.created_at else None,
            'updated_at': department.updated_at.isoformat() if department.updated_at else None,
        })
    except Exception as e:
        logger.error(f"Error updating department: {str(e)}")
        return Response({'error': 'Failed to update department'}, status=500)

@api_view(['DELETE'])
def delete_department(request, id):
    """
    Delete a mining department.
    """
    try:
        from .models import MiningDepartment
        
        # Find and delete the department
        try:
            department = MiningDepartment.objects.get(id=id)
            department.delete()
            return Response({'message': 'Department deleted successfully'}, status=200)
        except MiningDepartment.DoesNotExist:
            return Response({'error': 'Department not found'}, status=404)
    except Exception as e:
        logger.error(f"Error deleting department: {str(e)}")
        return Response({'error': 'Failed to delete department'}, status=500)