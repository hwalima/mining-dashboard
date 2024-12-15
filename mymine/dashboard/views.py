from django.shortcuts import render
from rest_framework import viewsets, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from datetime import timedelta
from django.db.models import Sum, Avg, Count, F, Q, DecimalField, Max, Min
from django.db.models.functions import Cast
from decimal import Decimal
from .models import (
    Machinery, ChemicalInventory, SafetyIncident, 
    EnergyUsage, MaintenanceRecord, EquipmentStatusLog, 
    ChemicalUsage, ExplosivesUsage, ExplosivesInventory, EnvironmentalMetric
)
from mining_operations.models import (
    DailyProductionLog, DailyChemicalsUsed, MiningChemical, 
    MiningDepartment, LaborMetric
)
import datetime

# Create your views here.

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_daily_logs(request):
    """
    Get daily production logs for the last 30 days
    """
    end_date = timezone.now().date()
    start_date = end_date - timedelta(days=30)
    
    logs = DailyProductionLog.objects.filter(
        date__range=[start_date, end_date]
    ).order_by('-date')

    # Get today's production and daily target from settings or environment
    from django.conf import settings
    daily_target = getattr(settings, 'DAILY_PRODUCTION_TARGET', 200)
    today_production = logs.filter(date=end_date).aggregate(Sum('smelted_gold'))['smelted_gold__sum'] or 0

    summary = {
        'total_production': logs.aggregate(Sum('smelted_gold'))['smelted_gold__sum'] or 0,
        'average_daily': logs.aggregate(Avg('smelted_gold'))['smelted_gold__avg'] or 0,
        'today_production': today_production,
        'target_achievement': (today_production / daily_target * 100) if daily_target > 0 else 0
    }

    # Convert logs to a format compatible with the dashboard
    logs_data = [{
        'date': log.date,
        'production': log.smelted_gold,
        'efficiency': log.operational_efficiency,
        'notes': log.notes
    } for log in logs]

    return Response({
        'logs': logs_data,
        'summary': summary
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_machinery_status(request):
    """
    Get machinery status and maintenance information
    """
    machinery = Machinery.objects.all()
    
    summary = {
        'total_count': machinery.count(),
        'operational_count': machinery.filter(status='Operational').count(),
        'maintenance_count': machinery.filter(status='Under Maintenance').count(),
        'efficiency_average': machinery.aggregate(Avg('efficiency'))['efficiency__avg'] or 0,
        'maintenance_due': machinery.filter(next_maintenance__lte=timezone.now().date()).count()
    }

    return Response({
        'machinery': list(machinery.values(
            'id', 'name', 'type', 'status', 'efficiency',
            'last_maintenance', 'next_maintenance'
        )),
        'summary': summary
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_chemical_inventory(request):
    """
    Get chemical inventory status with alerts for low stock
    """
    chemicals = ChemicalInventory.objects.all()
    
    # Get chemicals that need restocking (current_stock < minimum_required)
    low_stock = chemicals.filter(current_stock__lt=F('minimum_required'))
    
    summary = {
        'total_chemicals': chemicals.count(),
        'low_stock_count': low_stock.count(),
        'total_value': sum((c.current_stock * (c.unit_price or 0)) for c in chemicals),
        'restocking_needed': [
            {
                'name': c.name,
                'current': c.current_stock,
                'required': c.minimum_required,
                'unit': c.unit
            }
            for c in low_stock
        ]
    }

    return Response({
        'chemicals': list(chemicals.values(
            'id', 'name', 'current_stock', 'minimum_required',
            'unit', 'last_restocked'
        )),
        'summary': summary
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_safety_incidents(request):
    """
    Get safety incidents and safety metrics
    """
    # Get date range from request parameters
    from_date = request.GET.get('from_date')
    to_date = request.GET.get('to_date')
    
    if from_date and to_date:
        start_date = datetime.datetime.strptime(from_date, '%Y-%m-%d').date()
        end_date = datetime.datetime.strptime(to_date, '%Y-%m-%d').date()
    else:
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=30)
    
    incidents = SafetyIncident.objects.filter(
        date__range=[start_date, end_date]
    ).order_by('-date')

    # Calculate days without incidents (case-insensitive)
    last_incident = SafetyIncident.objects.filter(
        severity__iexact='High',
        date__range=[start_date, end_date]
    ).order_by('-date').first()
    
    days_without_incident = 0
    if last_incident:
        days_without_incident = (end_date - last_incident.date).days

    total_incidents = incidents.count()
    
    # Get incidents by department
    department_incidents = {}
    for dept in MiningDepartment.objects.all():
        count = incidents.filter(department=dept).count()
        if count > 0:
            department_incidents[dept.name] = count

    summary = {
        'total_incidents': total_incidents,
        'days_without_incident': days_without_incident,
        'severity_breakdown': {
            'low': incidents.filter(severity__iexact='Low').count(),
            'medium': incidents.filter(severity__iexact='Medium').count(),
            'high': incidents.filter(severity__iexact='High').count()
        },
        'department_breakdown': department_incidents,
        'resolved_percentage': (
            incidents.filter(resolved=True).count() / total_incidents * 100
        ) if total_incidents > 0 else 100  # 100% if no incidents
    }

    return Response({
        'incidents': list(incidents.select_related('department').values(
            'id', 'date', 'type', 'severity',
            'description', 'action_taken', 'resolved',
            department_name=F('department__name')  # Alias the department name
        )),
        'summary': summary
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_energy_usage(request):
    """
    Get energy usage data for a given date range
    """
    from_date = request.query_params.get('from_date')
    to_date = request.query_params.get('to_date')

    if not from_date or not to_date:
        return Response({"error": "from_date and to_date are required"}, status=400)

    try:
        # Convert string dates to date objects
        from_date = datetime.datetime.strptime(from_date, '%Y-%m-%d').date()
        to_date = datetime.datetime.strptime(to_date, '%Y-%m-%d').date()
        
        # Calculate date range difference
        date_diff = (to_date - from_date).days + 1
        
        # Get energy data for the date range
        energy_data = EnergyUsage.objects.filter(
            date__range=[from_date, to_date]
        ).order_by('-date')

        # Get previous period data for trend calculation
        prev_from_date = from_date - timedelta(days=date_diff)
        prev_to_date = from_date - timedelta(days=1)
        prev_energy_data = EnergyUsage.objects.filter(
            date__range=[prev_from_date, prev_to_date]
        )
        
        # Calculate current period totals
        current_totals = energy_data.aggregate(
            total_electricity_kwh=Sum('electricity_kwh'),
            total_electricity_cost=Sum('electricity_cost'),
            total_diesel_liters=Sum('diesel_liters'),
            total_diesel_cost=Sum('diesel_cost'),
            total_cost=Sum('total_cost')
        )
        
        # Calculate previous period totals
        prev_totals = prev_energy_data.aggregate(
            prev_electricity_kwh=Sum('electricity_kwh'),
            prev_diesel_liters=Sum('diesel_liters'),
            prev_total_cost=Sum('total_cost')
        )
        
        # Ensure we have values even if there's no data
        current_totals = {k: float(v) if v is not None else 0 for k, v in current_totals.items()}
        prev_totals = {k: float(v) if v is not None else 0 for k, v in prev_totals.items()}
        
        # Calculate daily averages
        avg_electricity_kwh = current_totals['total_electricity_kwh'] / date_diff if date_diff > 0 else 0
        avg_diesel_liters = current_totals['total_diesel_liters'] / date_diff if date_diff > 0 else 0
        
        # Calculate trends (difference in daily averages between periods)
        prev_avg_electricity = prev_totals['prev_electricity_kwh'] / date_diff if date_diff > 0 else 0
        prev_avg_diesel = prev_totals['prev_diesel_liters'] / date_diff if date_diff > 0 else 0
        prev_avg_cost = prev_totals['prev_total_cost'] / date_diff if date_diff > 0 else 0
        
        trend_electricity = avg_electricity_kwh - prev_avg_electricity
        trend_diesel = avg_diesel_liters - prev_avg_diesel
        trend_cost = (current_totals['total_cost'] / date_diff) - prev_avg_cost

        # Format the response to match frontend expectations
        response_data = {
            'data': [{
                'date': item.date,
                'electricity_kwh': float(item.electricity_kwh),
                'electricity_cost': float(item.electricity_cost),
                'diesel_liters': float(item.diesel_liters),
                'diesel_cost': float(item.diesel_cost),
                'total_cost': float(item.total_cost)
            } for item in energy_data],
            'summary': {
                'total_electricity_kwh': current_totals['total_electricity_kwh'],
                'total_electricity_cost': current_totals['total_electricity_cost'],
                'total_diesel_liters': current_totals['total_diesel_liters'],
                'total_diesel_cost': current_totals['total_diesel_cost'],
                'total_cost': current_totals['total_cost'],
                'avg_electricity_kwh': avg_electricity_kwh,
                'avg_diesel_liters': avg_diesel_liters,
                'trend_electricity': trend_electricity,
                'trend_diesel': trend_diesel,
                'trend_cost': trend_cost
            }
        }

        return Response(response_data)

    except ValueError as e:
        return Response({
            'error': f'Invalid date format. Please use YYYY-MM-DD format. Error: {str(e)}'
        }, status=400)
    except Exception as e:
        return Response({
            'error': f'An error occurred: {str(e)}'
        }, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_equipment_status(request):
    """
    Get equipment status data for a given date range
    """
    from_date = request.query_params.get('from_date')
    to_date = request.query_params.get('to_date')

    if not from_date or not to_date:
        return Response({"error": "from_date and to_date are required"}, status=400)

    try:
        # Convert string dates to date objects
        from_date = datetime.datetime.strptime(from_date, '%Y-%m-%d').date()
        to_date = datetime.datetime.strptime(to_date, '%Y-%m-%d').date()
        
        # Get all machinery
        machinery = Machinery.objects.all()
        
        # Get status logs for the period
        status_logs = EquipmentStatusLog.objects.filter(
            date__range=[from_date, to_date]
        ).select_related('machinery')
        
        # Get the latest status for each machine in the period
        latest_statuses = {}
        for log in status_logs:
            if log.machinery_id not in latest_statuses or log.date > latest_statuses[log.machinery_id]['date']:
                latest_statuses[log.machinery_id] = {
                    'status': log.status,
                    'date': log.date
                }
        
        # Calculate status counts based on period status
        operational_count = sum(1 for status in latest_statuses.values() if status['status'] == 'Operational')
        maintenance_count = sum(1 for status in latest_statuses.values() if status['status'] == 'Under Maintenance')
        out_of_service_count = sum(1 for status in latest_statuses.values() if status['status'] == 'Out of Service')
        
        # Get maintenance records for the date range
        maintenance_records = MaintenanceRecord.objects.filter(
            date__range=[from_date, to_date]
        ).select_related('machinery')
        
        # Calculate maintenance costs and hours
        maintenance_costs = maintenance_records.aggregate(
            total_cost=Sum('cost'),
            total_hours=Sum('duration_hours')
        )
        total_maintenance_cost = maintenance_costs['total_cost'] or 0
        total_maintenance_hours = maintenance_costs['total_hours'] or 0
        
        # Calculate average efficiency for the period
        avg_efficiency = machinery.aggregate(Avg('efficiency'))['efficiency__avg'] or 0
        
        # Calculate trends
        prev_from_date = from_date - (to_date - from_date)
        prev_maintenance_records = MaintenanceRecord.objects.filter(
            date__range=[prev_from_date, from_date - timedelta(days=1)]
        )
        
        prev_maintenance_cost = prev_maintenance_records.aggregate(
            Avg('cost')
        )['cost__avg'] or total_maintenance_cost
        
        trend_maintenance_cost = float(total_maintenance_cost - prev_maintenance_cost)
        
        # Calculate efficiency trend
        prev_efficiency = machinery.aggregate(Avg('efficiency'))['efficiency__avg'] or avg_efficiency
        trend_efficiency = float(avg_efficiency - prev_efficiency)

        # Prepare equipment data with status history
        equipment_data = []
        for machine in machinery:
            # Get status logs for this machine in the period
            machine_status_logs = status_logs.filter(machinery=machine).order_by('-date')
            current_status = machine_status_logs.first().status if machine_status_logs.exists() else machine.status
            
            maintenance_history = maintenance_records.filter(
                machinery=machine
            ).order_by('-date').values('date', 'type', 'description', 'cost', 'duration_hours')
            
            equipment_data.append({
                'id': machine.id,
                'name': machine.name,
                'type': machine.type,
                'status': current_status,
                'efficiency': float(machine.efficiency),
                'last_maintenance': machine.last_maintenance,
                'next_maintenance_due': machine.next_maintenance_due,
                'operating_hours': float(machine.operating_hours),
                'maintenance_history': list(maintenance_history),
                'status_history': list(machine_status_logs.values('date', 'status', 'notes'))
            })

        response_data = {
            'data': equipment_data,
            'summary': {
                'total_count': len(machinery),
                'operational_count': operational_count,
                'maintenance_count': maintenance_count,
                'out_of_service_count': out_of_service_count,
                'avg_efficiency': float(avg_efficiency),
                'total_maintenance_cost': float(total_maintenance_cost),
                'total_maintenance_hours': float(total_maintenance_hours),
                'trend_efficiency': trend_efficiency,
                'trend_maintenance_cost': trend_maintenance_cost
            }
        }

        return Response(response_data)
    except ValueError as e:
        print(f"ValueError in get_equipment_status: {str(e)}")
        return Response({"error": str(e)}, status=400)
    except Exception as e:
        print(f"Error in get_equipment_status: {str(e)}")
        return Response({"error": "An error occurred while fetching equipment status"}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_gold_production(request):
    """
    Get gold production data for a given date range
    """
    from_date = request.query_params.get('from_date')
    to_date = request.query_params.get('to_date')

    if not from_date or not to_date:
        return Response({"error": "from_date and to_date are required"}, status=400)

    try:
        print(f"\n=== Processing gold production data request ===")
        print(f"From: {from_date} To: {to_date}")
        
        # Convert string dates to date objects
        from_date = datetime.datetime.strptime(from_date, '%Y-%m-%d').date()
        to_date = datetime.datetime.strptime(to_date, '%Y-%m-%d').date()
        
        # Calculate date range difference
        date_diff = (to_date - from_date).days + 1
        print(f"Date range spans {date_diff} days")

        # Get production data for the date range
        production_data = DailyProductionLog.objects.filter(
            date__range=[from_date, to_date]
        ).order_by('-date')
        
        print(f"Found {production_data.count()} production records")
        
        # Print all records for debugging
        for record in production_data:
            print(f"Date: {record.date}, Crushed: {record.total_tonnage_crushed}t, " +
                  f"Hoisted: {record.total_tonnage_hoisted}t, Recovery: {record.gold_recovery_rate}%")

        # Calculate period totals and averages
        totals = production_data.aggregate(
            total_crushed=Sum('total_tonnage_crushed'),
            total_hoisted=Sum('total_tonnage_hoisted'),
            total_gold_smelted=Sum('gold_smelted'),
            avg_recovery=Avg('gold_recovery_rate'),
            avg_efficiency=Avg('operational_efficiency')
        )
        
        # Ensure we have values even if there's no data
        totals = {k: v or 0 for k, v in totals.items()}
        
        print(f"\nPeriod totals and averages:")
        print(f"Total Crushed: {totals['total_crushed']}t")
        print(f"Total Hoisted: {totals['total_hoisted']}t")
        print(f"Total Gold Smelted: {totals['total_gold_smelted']}g")
        print(f"Average Recovery Rate: {totals['avg_recovery']}%")
        print(f"Average Efficiency: {totals['avg_efficiency']}%")

        # Calculate daily averages
        daily_avg_crushed = totals['total_crushed'] / date_diff if date_diff > 0 else 0
        daily_avg_hoisted = totals['total_hoisted'] / date_diff if date_diff > 0 else 0
        daily_avg_gold_smelted = totals['total_gold_smelted'] / date_diff if date_diff > 0 else 0

        # Calculate trends
        prev_from_date = from_date - (to_date - from_date)
        prev_production = DailyProductionLog.objects.filter(
            date__range=[prev_from_date, from_date - timedelta(days=1)]
        )
        
        print(f"\nPrevious period: {prev_from_date} to {from_date - timedelta(days=1)}")
        print(f"Found {prev_production.count()} previous period records")
        
        prev_totals = prev_production.aggregate(
            prev_crushed=Sum('total_tonnage_crushed'),
            prev_hoisted=Sum('total_tonnage_hoisted'),
            prev_gold_smelted=Sum('gold_smelted'),
            prev_recovery=Avg('gold_recovery_rate'),
            prev_efficiency=Avg('operational_efficiency')
        )
        
        # Ensure we have values for previous period
        prev_totals = {k: v or 0 for k, v in prev_totals.items()}
        
        # Calculate trends as the difference between current and previous period averages
        trend_crushed = float((totals['total_crushed'] / date_diff) - 
                            (prev_totals['prev_crushed'] / date_diff)) if date_diff > 0 else 0
        trend_hoisted = float((totals['total_hoisted'] / date_diff) - 
                            (prev_totals['prev_hoisted'] / date_diff)) if date_diff > 0 else 0
        trend_gold_smelted = float((totals['total_gold_smelted'] / date_diff) - 
                                 (prev_totals['prev_gold_smelted'] / date_diff)) if date_diff > 0 else 0
        trend_recovery = float(totals['avg_recovery'] - prev_totals['prev_recovery'])
        trend_efficiency = float(totals['avg_efficiency'] - prev_totals['prev_efficiency'])

        print(f"\nTrends:")
        print(f"Crushed trend: {trend_crushed}t/day")
        print(f"Hoisted trend: {trend_hoisted}t/day")
        print(f"Recovery trend: {trend_recovery}%")
        print(f"Efficiency trend: {trend_efficiency}%")

        response_data = {
            'data': [{
                'date': item.date,
                'total_tonnage_crushed': float(item.total_tonnage_crushed),
                'total_tonnage_hoisted': float(item.total_tonnage_hoisted),
                'gold_smelted': float(item.gold_smelted),
                'gold_recovery_rate': float(item.gold_recovery_rate),
                'operational_efficiency': float(item.operational_efficiency)
            } for item in production_data],
            'summary': {
                'total_tonnage_crushed': float(totals['total_crushed']),
                'total_tonnage_hoisted': float(totals['total_hoisted']),
                'total_gold_smelted': float(totals['total_gold_smelted']),
                'avg_gold_recovery_rate': float(totals['avg_recovery']),
                'avg_operational_efficiency': float(totals['avg_efficiency']),
                'daily_avg_crushed': float(daily_avg_crushed),
                'daily_avg_hoisted': float(daily_avg_hoisted),
                'daily_avg_gold_smelted': float(daily_avg_gold_smelted),
                'trend_crushed': trend_crushed,
                'trend_hoisted': trend_hoisted,
                'trend_gold_smelted': trend_gold_smelted,
                'trend_recovery': trend_recovery,
                'trend_efficiency': trend_efficiency
            }
        }

        return Response(response_data)
    except ValueError as e:
        print(f"ValueError in get_gold_production: {str(e)}")
        return Response({"error": str(e)}, status=400)
    except Exception as e:
        print(f"Error in get_gold_production: {str(e)}")
        return Response({"error": "An error occurred while fetching production data"}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_chemicals_usage(request):
    """
    Get chemicals usage data for a given date range
    """
    from_date = request.query_params.get('from_date')
    to_date = request.query_params.get('to_date')

    if not from_date or not to_date:
        return Response({"error": "from_date and to_date are required"}, status=400)

    try:
        from_date = datetime.datetime.strptime(from_date, '%Y-%m-%d').date()
        to_date = datetime.datetime.strptime(to_date, '%Y-%m-%d').date()
        
        # Get chemical usage data for the date range
        chemical_usage = ChemicalUsage.objects.filter(
            date__range=[from_date, to_date]
        ).select_related('chemical')

        # Calculate daily averages
        days_in_range = (to_date - from_date).days + 1

        # Get all chemicals from inventory
        chemicals = ChemicalInventory.objects.all()
        
        # Aggregate data by chemical
        chemical_data = []
        total_value_used = Decimal('0.0')
        low_stock_count = 0
        warning_stock_count = 0

        for chemical in chemicals:
            usage_records = chemical_usage.filter(chemical__name=chemical.name)
            
            # Keep values as Decimal for calculations
            total_used = usage_records.aggregate(
                total=Cast(Sum('amount_used'), DecimalField(max_digits=15, decimal_places=2))
            )['total'] or Decimal('0')
            
            unit_price = chemical.unit_price or Decimal('0')
            total_cost = total_used * unit_price
            current_stock = chemical.current_stock
            min_required = chemical.minimum_required
            
            # Calculate average daily usage
            avg_daily = total_used / Decimal(str(max(days_in_range, 1)))
            
            # Calculate warning thresholds
            warning_threshold = min_required * Decimal('1.5')  # 50% above minimum
            
            # Determine status
            status = 'Normal'
            if current_stock <= min_required:
                status = 'Low'
                low_stock_count += 1
            elif current_stock <= warning_threshold:
                status = 'Warning'
                warning_stock_count += 1

            total_value_used += total_cost
            
            chemical_data.append({
                'name': chemical.name,
                'amount_used': float(total_used),  # Convert to float for JSON serialization
                'unit': chemical.unit,
                'value_used': float(total_cost),  # Convert to float for JSON serialization
                'current_stock': float(current_stock),  # Convert to float for JSON serialization
                'avg_daily_usage': float(avg_daily),  # Convert to float for JSON serialization
                'status': status
            })

        # Sort chemicals by value used (descending)
        chemical_data.sort(key=lambda x: x['value_used'], reverse=True)

        response_data = {
            'data': chemical_data,
            'summary': {
                'total_chemicals': len(chemical_data),
                'low_stock_count': low_stock_count,
                'warning_stock_count': warning_stock_count,
                'total_value_used': float(total_value_used)
            }
        }

        return Response(response_data)

    except ValueError as e:
        return Response({
            'error': f'Invalid date format. Please use YYYY-MM-DD format. Error: {str(e)}'
        }, status=400)
    except Exception as e:
        import traceback
        return Response({
            'error': f'An error occurred: {str(e)}',
            'trace': traceback.format_exc()
        }, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_explosives_data(request):
    """
    Get explosives inventory and usage data for a given date range
    """
    import traceback
    import logging
    logger = logging.getLogger('dashboard')

    try:
        logger.info("=== Starting get_explosives_data ===")
        logger.info(f"Request user: {request.user}")
        logger.info(f"Request params: {request.query_params}")

        # Get date range from request
        from_date = request.query_params.get('from_date')
        to_date = request.query_params.get('to_date')

        logger.info(f"Raw date params: from_date={from_date}, to_date={to_date}")

        if not from_date or not to_date:
            # Use current time from settings
            current_time = datetime.datetime(2024, 12, 13, 16, 30, 53, tzinfo=datetime.timezone(datetime.timedelta(hours=2)))
            end_date = current_time.date()
            start_date = end_date - timedelta(days=30)
            logger.info(f"Using default date range: {start_date} to {end_date}")
        else:
            try:
                start_date = datetime.datetime.strptime(from_date, '%Y-%m-%d').date()
                end_date = datetime.datetime.strptime(to_date, '%Y-%m-%d').date()
                logger.info(f"Parsed date range: {start_date} to {end_date}")
            except ValueError as e:
                logger.error(f"Date parsing error: {str(e)}")
                return Response({
                    'error': 'Invalid date format',
                    'detail': str(e)
                }, status=400)

        # Get explosives usage data
        try:
            logger.info("Querying explosives usage data...")
            usage_data = ExplosivesUsage.objects.filter(
                date__range=[start_date, end_date]
            ).select_related('explosive')
            logger.info(f"Found {usage_data.count()} usage records")
            
            # Print first few records for debugging
            for usage in usage_data[:3]:
                logger.info(f"Sample usage record: {usage.date} - {usage.explosive.name} - {usage.amount_used}")
        except Exception as e:
            logger.error(f"Error querying usage data: {str(e)}\n{traceback.format_exc()}")
            return Response({
                'error': 'Database error while fetching usage data',
                'detail': str(e)
            }, status=500)

        # Calculate inventory status at the end date
        inventory_status = []
        for explosive in ExplosivesInventory.objects.all():
            # Get total usage in the period
            total_used = ExplosivesUsage.objects.filter(
                explosive=explosive,
                date__range=[start_date, end_date]
            ).aggregate(total=Sum('amount_used'))['total'] or 0

            # Get total restocked in the period (based on last_restocked date)
            total_restocked = ExplosivesInventory.objects.filter(
                id=explosive.id,
                last_restocked__range=[start_date, end_date]
            ).count() * (explosive.minimum_required * Decimal('2.0'))  # Each restock is 2x minimum

            # Calculate current stock for the period
            period_stock = explosive.current_stock + total_used - total_restocked
            
            inventory_status.append({
                'id': explosive.id,
                'name': explosive.name,
                'type': explosive.type,
                'current_stock': period_stock,
                'minimum_required': explosive.minimum_required,
                'unit': explosive.unit,
                'last_restocked': explosive.last_restocked
            })

        # Calculate low stock and warning counts based on period inventory
        low_stock_count = sum(1 for inv in inventory_status 
                            if inv['current_stock'] < inv['minimum_required'])
        warning_stock_count = sum(1 for inv in inventory_status 
                                if inv['minimum_required'] <= inv['current_stock'] < inv['minimum_required'] * Decimal('1.2'))
        
        # Calculate summary metrics
        total_usage = {}
        effectiveness_ratings = []
        for usage in usage_data:
            key = f"{usage.explosive.name} ({usage.explosive.unit})"
            total_usage[key] = total_usage.get(key, 0) + float(usage.amount_used)
            if usage.effectiveness_rating:
                effectiveness_ratings.append(float(usage.effectiveness_rating))
        logger.info(f"Calculated total usage: {total_usage}")
        
        avg_effectiveness = sum(effectiveness_ratings) / len(effectiveness_ratings) if effectiveness_ratings else 0
        logger.info(f"Average effectiveness: {avg_effectiveness}")

        # Prepare response data
        try:
            logger.info("Preparing response data...")
            response_data = {
                'data': [{
                    'date': usage.date,
                    'explosive_name': usage.explosive.name,
                    'amount_used': float(usage.amount_used),
                    'unit': usage.explosive.unit,
                    'blast_location': usage.blast_location,
                    'blast_purpose': usage.blast_purpose,
                    'effectiveness_rating': float(usage.effectiveness_rating) if usage.effectiveness_rating else None,
                    'status': 'Low' if usage.explosive.current_stock < usage.explosive.minimum_required else
                             'Warning' if usage.explosive.current_stock < usage.explosive.minimum_required * Decimal('1.2') else 'Normal'
                } for usage in usage_data],
                'inventory': [{
                    'id': inv['id'],
                    'name': inv['name'],
                    'type': inv['type'],
                    'current_stock': float(inv['current_stock']),
                    'minimum_required': float(inv['minimum_required']),
                    'unit': inv['unit'],
                    'last_restocked': inv['last_restocked'],
                    'status': 'Low' if inv['current_stock'] < inv['minimum_required'] else
                             'Warning' if inv['current_stock'] < inv['minimum_required'] * Decimal('1.2') else 'Normal'
                } for inv in inventory_status],
                'summary': {
                    'total_explosives': ExplosivesInventory.objects.count(),
                    'low_stock_count': low_stock_count,
                    'warning_stock_count': warning_stock_count,
                    'total_usage': total_usage,
                    'avg_effectiveness_rating': round(avg_effectiveness, 2),
                    'total_blasts': usage_data.values('date', 'blast_location').distinct().count()
                }
            }
            logger.info("Successfully prepared response data")
            return Response(response_data)
        except Exception as e:
            logger.error(f"Error preparing response data: {str(e)}\n{traceback.format_exc()}")
            return Response({
                'error': 'Error preparing response data',
                'detail': str(e)
            }, status=500)

    except Exception as e:
        logger.error(f"Critical error in get_explosives_data: {str(e)}\n{traceback.format_exc()}")
        error_details = {
            'error': 'Unexpected error in get_explosives_data',
            'detail': str(e),
            'traceback': traceback.format_exc()
        }
        return Response(error_details, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_labor_metrics(request):
    """
    Get labor metrics data for a given date range
    """
    # Get date range from request parameters
    from_date = request.GET.get('from_date')
    to_date = request.GET.get('to_date')
    
    if not from_date or not to_date:
        return Response({'error': 'from_date and to_date are required'}, status=400)
    
    try:
        from_date = datetime.datetime.strptime(from_date, '%Y-%m-%d').date()
        to_date = datetime.datetime.strptime(to_date, '%Y-%m-%d').date()
    except ValueError:
        return Response({'error': 'Invalid date format. Use YYYY-MM-DD'}, status=400)

    # Get labor metrics from the database
    from mining_operations.models import LaborMetric, MiningDepartment
    
    # Get daily metrics
    daily_metrics = LaborMetric.objects.filter(
        date__range=[from_date, to_date]
    ).values(
        'date',
        'shift',
        'department__name',
        'workers_present',
        'hours_worked',
        'overtime_hours',
        'productivity_index',
        'safety_incidents'
    ).order_by('date', 'shift')

    # Calculate department metrics
    departments = MiningDepartment.objects.all()
    department_metrics = []
    total_workers = 0
    
    for dept in departments:
        dept_metrics = LaborMetric.objects.filter(
            date__range=[from_date, to_date],
            department=dept
        ).aggregate(
            worker_count=Avg('workers_present'),
            productivity=Avg('productivity_index'),
            incidents=Sum('safety_incidents')
        )
        
        worker_count = round(dept_metrics['worker_count'] or 0)
        total_workers += worker_count
        
        department_metrics.append({
            'name': dept.name,
            'worker_count': worker_count,
            'productivity': dept_metrics['productivity'] or 0,
            'incidents': dept_metrics['incidents'] or 0,
            'percentage': 0  # Will be calculated after getting total
        })

    # Calculate department percentages
    if total_workers > 0:
        for dept in department_metrics:
            dept['percentage'] = (dept['worker_count'] / total_workers) * 100

    # Calculate summary metrics
    summary_metrics = LaborMetric.objects.filter(
        date__range=[from_date, to_date]
    ).aggregate(
        total_workers=Avg('workers_present'),
        avg_hours=Avg('hours_worked'),
        avg_productivity=Avg('productivity_index'),
        total_incidents=Sum('safety_incidents')
    )

    # Calculate trends (comparing to previous period)
    period_length = (to_date - from_date).days + 1
    previous_from_date = from_date - timedelta(days=period_length)
    previous_to_date = from_date - timedelta(days=1)
    
    previous_metrics = LaborMetric.objects.filter(
        date__range=[previous_from_date, previous_to_date]
    ).aggregate(
        prev_attendance=Avg('workers_present'),
        prev_productivity=Avg('productivity_index'),
        prev_incidents=Sum('safety_incidents')
    )

    # Calculate trend percentages
    current_attendance = summary_metrics['total_workers'] or 0
    current_productivity = summary_metrics['avg_productivity'] or 0
    current_incidents = summary_metrics['total_incidents'] or 0
    
    prev_attendance = previous_metrics['prev_attendance'] or current_attendance
    prev_productivity = previous_metrics['prev_productivity'] or current_productivity
    prev_incidents = previous_metrics['prev_incidents'] or current_incidents

    attendance_trend = ((current_attendance - prev_attendance) / prev_attendance * 100) if prev_attendance > 0 else 0
    productivity_trend = ((current_productivity - prev_productivity) / prev_productivity * 100) if prev_productivity > 0 else 0
    incidents_trend = ((current_incidents - prev_incidents) / prev_incidents * 100) if prev_incidents > 0 else 0

    # Calculate attendance rate
    total_expected_workers = sum(dept['worker_count'] for dept in department_metrics)
    attendance_rate = (current_attendance / total_expected_workers * 100) if total_expected_workers > 0 else 0

    # Prepare response
    response_data = {
        'daily_metrics': list(daily_metrics),
        'departments': department_metrics,
        'summary': {
            'total_workers': round(summary_metrics['total_workers'] or 0),
            'attendance_rate': round(attendance_rate, 1),
            'productivity_rate': round(summary_metrics['avg_productivity'] or 0, 1),
            'incidents': summary_metrics['total_incidents'] or 0,
            'attendance_trend': round(attendance_trend, 1),
            'productivity_trend': round(productivity_trend, 1),
            'incidents_trend': round(incidents_trend, 1)
        }
    }

    return Response(response_data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_environmental_metrics(request):
    """
    Get environmental metrics data for a given date range
    """
    from_date = request.query_params.get('from_date')
    to_date = request.query_params.get('to_date')

    if not from_date or not to_date:
        return Response({"error": "from_date and to_date are required"}, status=400)

    try:
        # Convert string dates to date objects
        from_date = datetime.datetime.strptime(from_date, '%Y-%m-%d').date()
        to_date = datetime.datetime.strptime(to_date, '%Y-%m-%d').date()
        
        # Calculate date range difference
        date_diff = (to_date - from_date).days + 1
        
        # Get metrics for the current period
        current_metrics = EnvironmentalMetric.objects.filter(
            date__range=[from_date, to_date]
        ).order_by('-date')

        # Get metrics for the previous period for trend calculation
        prev_from_date = from_date - timedelta(days=date_diff)
        prev_to_date = from_date - timedelta(days=1)
        prev_metrics = EnvironmentalMetric.objects.filter(
            date__range=[prev_from_date, prev_to_date]
        )
        
        # Calculate current period statistics
        current_stats = current_metrics.aggregate(
            avg_dust=Avg('dust_level_pm10'),
            max_dust=Max('dust_level_pm10'),
            min_dust=Min('dust_level_pm10'),
            avg_noise=Avg('noise_level_db'),
            max_noise=Max('noise_level_db'),
            min_noise=Min('noise_level_db'),
            avg_water=Avg('water_usage_m3'),
            max_water=Max('water_usage_m3'),
            min_water=Min('water_usage_m3'),
            avg_ph=Avg('waste_water_ph'),
            max_ph=Max('waste_water_ph'),
            min_ph=Min('waste_water_ph'),
            latest_rehab=Max('rehabilitation_area_m2')
        )
        
        # Calculate previous period statistics for trends
        prev_stats = prev_metrics.aggregate(
            prev_dust=Avg('dust_level_pm10'),
            prev_noise=Avg('noise_level_db'),
            prev_water=Avg('water_usage_m3'),
            prev_ph=Avg('waste_water_ph'),
            prev_rehab=Max('rehabilitation_area_m2')
        )

        # Ensure we have values even if there's no data
        current_stats = {k: float(v) if v is not None else 0 for k, v in current_stats.items()}
        prev_stats = {k: float(v) if v is not None else 0 for k, v in prev_stats.items()}

        # Calculate trends
        dust_trend = current_stats['avg_dust'] - prev_stats['prev_dust']
        noise_trend = current_stats['avg_noise'] - prev_stats['prev_noise']
        water_trend = current_stats['avg_water'] - prev_stats['prev_water']
        ph_trend = current_stats['avg_ph'] - prev_stats['prev_ph']
        rehab_trend = current_stats['latest_rehab'] - prev_stats['prev_rehab']

        # Prepare response data
        response_data = {
            'data': [{
                'date': item.date,
                'dust_level_pm10': float(item.dust_level_pm10),
                'noise_level_db': float(item.noise_level_db),
                'water_usage_m3': float(item.water_usage_m3),
                'rehabilitation_area_m2': float(item.rehabilitation_area_m2),
                'waste_water_ph': float(item.waste_water_ph)
            } for item in current_metrics],
            'summary': {
                'dust_level': {
                    'average': round(current_stats['avg_dust'], 2),
                    'max': round(current_stats['max_dust'], 2),
                    'min': round(current_stats['min_dust'], 2),
                    'trend': round(dust_trend, 2)
                },
                'noise_level': {
                    'average': round(current_stats['avg_noise'], 1),
                    'max': round(current_stats['max_noise'], 1),
                    'min': round(current_stats['min_noise'], 1),
                    'trend': round(noise_trend, 1)
                },
                'water_usage': {
                    'average': round(current_stats['avg_water'], 1),
                    'max': round(current_stats['max_water'], 1),
                    'min': round(current_stats['min_water'], 1),
                    'trend': round(water_trend, 1)
                },
                'ph_level': {
                    'average': round(current_stats['avg_ph'], 2),
                    'max': round(current_stats['max_ph'], 2),
                    'min': round(current_stats['min_ph'], 2),
                    'trend': round(ph_trend, 2)
                },
                'rehabilitation': {
                    'current_area': round(current_stats['latest_rehab'], 1),
                    'trend': round(rehab_trend, 1)
                }
            }
        }

        return Response(response_data)

    except ValueError as e:
        return Response({
            'error': f'Invalid date format. Please use YYYY-MM-DD format. Error: {str(e)}'
        }, status=400)
    except Exception as e:
        return Response({
            'error': f'An error occurred: {str(e)}'
        }, status=500)
