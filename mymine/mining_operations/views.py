from django.shortcuts import render
from django.db.models import Avg, Sum, F, Max
from django.db.models.functions import ExtractDay
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta, date, datetime
from .models import (
    ExplosivesInventory, StockpileVolume,
    LaborMetric, EnvironmentalMetric, GoldMillingEquipment,
    SafetyIncident, DailyProductionLog, EnergyUsage, MiningChemical, MiningDepartment,
    SmeltedGold, EquipmentMaintenanceLog, HeavyMachinery, MiningSite
)
from .serializers import (
    ExplosivesInventorySerializer,
    StockpileVolumeSerializer,
    LaborMetricSerializer, EnvironmentalMetricSerializer
)
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample
from drf_spectacular.types import OpenApiTypes
import logging
logger = logging.getLogger(__name__)

@extend_schema(
    summary="Get dashboard data",
    description="Retrieve comprehensive mining operations data for the dashboard.",
    parameters=[
        OpenApiParameter(
            name='from_date',
            type=OpenApiTypes.DATE,
            location=OpenApiParameter.QUERY,
            description='Start date for filtering data (YYYY-MM-DD)',
            required=False
        ),
        OpenApiParameter(
            name='to_date',
            type=OpenApiTypes.DATE,
            location=OpenApiParameter.QUERY,
            description='End date for filtering data (YYYY-MM-DD)',
            required=False
        )
    ],
    responses={200: {
        "type": "object",
        "properties": {
            "production": {
                "type": "object",
                "properties": {
                    "data": {"type": "array", "items": {"type": "object"}},
                    "summary": {"type": "object"}
                }
            },
            "safety": {
                "type": "object",
                "properties": {
                    "data": {"type": "array", "items": {"type": "object"}},
                    "summary": {"type": "object"}
                }
            },
            "equipment": {
                "type": "object",
                "properties": {
                    "data": {"type": "array", "items": {"type": "object"}},
                    "summary": {"type": "object"}
                }
            },
            "explosives": {
                "type": "object",
                "properties": {
                    "data": {"type": "array", "items": {"type": "object"}},
                    "summary": {"type": "object"}
                }
            },
            "stockpile": {
                "type": "object",
                "properties": {
                    "data": {"type": "array", "items": {"type": "object"}},
                    "summary": {"type": "object"}
                }
            },
            "expenses": {
                "type": "object",
                "properties": {
                    "data": {"type": "array", "items": {"type": "object"}},
                    "summary": {"type": "object"}
                }
            },
            "labor": {
                "type": "object",
                "properties": {
                    "data": {"type": "array", "items": {"type": "object"}},
                    "departments": {"type": "array", "items": {"type": "object"}},
                    "summary": {
                        "type": "object",
                        "properties": {
                            "total_workers": {"type": "number"},
                            "avg_attendance": {"type": "number"},
                            "avg_productivity": {"type": "number"},
                            "total_incidents": {"type": "number"},
                            "trend_attendance": {"type": "number"},
                            "trend_productivity": {"type": "number"},
                            "trend_incidents": {"type": "number"}
                        }
                    }
                }
            },
            "environmental": {
                "type": "object",
                "properties": {
                    "data": {"type": "array", "items": {"type": "object"}},
                    "summary": {
                        "type": "object",
                        "properties": {
                            "avg_dust": {"type": "number"},
                            "avg_noise": {"type": "number"},
                            "avg_water_usage": {"type": "number"},
                            "total_rehabilitation": {"type": "number"},
                            "avg_ph": {"type": "number"}
                        }
                    }
                }
            }
        }
    }}
)
@api_view(['GET'])
@permission_classes([AllowAny])  # Allow unauthenticated access
def dashboard_data(request):
    try:
        from_date = request.query_params.get('from_date')
        to_date = request.query_params.get('to_date')
        
        if from_date:
            from_date = date.fromisoformat(from_date)
        else:
            from_date = timezone.now().date() - timedelta(days=30)
            
        if to_date:
            to_date = date.fromisoformat(to_date)
        else:
            to_date = timezone.now().date()
    except ValueError:
        return Response({"error": "Invalid date format. Use YYYY-MM-DD"}, status=400)

    # Get labor metrics for the date range
    labor_metrics = LaborMetric.objects.filter(
        date__range=[from_date, to_date]
    )

    # Calculate summary metrics
    total_workers = labor_metrics.aggregate(
        total=Avg('workers_present')
    )['total'] or 0

    avg_productivity = labor_metrics.aggregate(
        avg=Avg('productivity_index')
    )['avg'] or 0

    total_incidents = labor_metrics.aggregate(
        total=Sum('safety_incidents')
    )['total'] or 0

    # Calculate department-wise metrics
    department_metrics = labor_metrics.values(
        'department__name'
    ).annotate(
        worker_count=Avg('workers_present'),
        avg_productivity=Avg('productivity_index'),
        total_incidents=Sum('safety_incidents')
    ).order_by('-worker_count')

    # Calculate trends
    previous_range = to_date - from_date
    previous_from = from_date - previous_range
    previous_metrics = LaborMetric.objects.filter(
        date__range=[previous_from, from_date]
    )

    prev_productivity = previous_metrics.aggregate(
        avg=Avg('productivity_index')
    )['avg'] or 0
    
    prev_incidents = previous_metrics.aggregate(
        total=Sum('safety_incidents')
    )['total'] or 0

    prev_workers = previous_metrics.aggregate(
        avg=Avg('workers_present')
    )['avg'] or 0

    # Calculate trend percentages
    trend_productivity = ((avg_productivity - prev_productivity) / prev_productivity * 100) if prev_productivity else 0
    trend_incidents = ((total_incidents - prev_incidents) / prev_incidents * 100) if prev_incidents else 0
    trend_workers = ((total_workers - prev_workers) / prev_workers * 100) if prev_workers else 0

    labor_data = {
        'data': LaborMetricSerializer(labor_metrics, many=True).data,
        'departments': list(department_metrics),
        'summary': {
            'total_workers': round(total_workers),
            'avg_attendance': 85,  # This should be calculated based on expected vs actual workers
            'avg_productivity': avg_productivity,
            'total_incidents': total_incidents,
            'trend_attendance': trend_workers,
            'trend_productivity': trend_productivity,
            'trend_incidents': trend_incidents
        }
    }

    # Get production data
    production_data = DailyProductionLog.objects.filter(
        date__range=[from_date, to_date]
    ).order_by('date').values(
        'date',
        'total_tonnage_crushed',
        'total_tonnage_hoisted',
        'gold_recovery_rate',
        'operational_efficiency'
    )

    # Get safety data
    safety_data = SafetyIncident.objects.filter(
        date__date__range=[from_date, to_date]
    ).order_by('date').values(
        'date',
        'incident_type',
        'severity',
        'description'
    )

    # Get equipment data
    equipment_data = GoldMillingEquipment.objects.filter(
        last_maintenance_date__range=[from_date, to_date]
    ).values(
        'name',
        'type',
        'current_status',
        'efficiency_percentage',
        'last_maintenance_date'
    )

    # Get environmental metrics data
    environmental_data = EnvironmentalMetric.objects.filter(
        date__range=[from_date, to_date]
    ).order_by('date').values(
        'date',
        'dust_level_pm10',
        'noise_level_db',
        'water_usage_m3',
        'rehabilitation_area_m2',
        'waste_water_ph'
    )

    # Get explosives inventory data
    explosives_data = ExplosivesInventory.objects.filter(
        date__range=[from_date, to_date]
    ).order_by('date')

    # Get stockpile volume data
    stockpile_data = StockpileVolume.objects.filter(
        date__range=[from_date, to_date]
    ).order_by('date')

    # Get daily expenses data
    expenses_data = DailyExpense.objects.filter(
        date__range=[from_date, to_date]
    ).order_by('date')

    # Get energy usage data
    energy_data = EnergyUsage.objects.filter(
        date__range=[from_date, to_date]
    ).order_by('date')

    # Get chemicals usage data
    chemicals_data = DailyChemicalsUsed.objects.filter(
        date__range=[from_date, to_date]
    ).order_by('date')

    # Calculate summaries for the filtered date range
    production_summary = {
        'avg_tonnage_crushed': production_data.aggregate(Avg('total_tonnage_crushed'))['total_tonnage_crushed__avg'],
        'avg_recovery_rate': production_data.aggregate(Avg('gold_recovery_rate'))['gold_recovery_rate__avg'],
        'total_tonnage': production_data.aggregate(Sum('total_tonnage_crushed'))['total_tonnage_crushed__sum']
    }

    safety_summary = {
        'total_incidents': safety_data.count(),
        'critical_incidents': safety_data.filter(severity='critical').count(),
        'high_severity': safety_data.filter(severity='high').count()
    }

    equipment_summary = {
        'operational_count': equipment_data.filter(current_status='operational').count(),
        'maintenance_count': equipment_data.filter(current_status='maintenance').count()
    }

    environmental_summary = {
        'avg_dust': environmental_data.aggregate(Avg('dust_level_pm10'))['dust_level_pm10__avg'],
        'avg_noise': environmental_data.aggregate(Avg('noise_level_db'))['noise_level_db__avg'],
        'avg_water_usage': environmental_data.aggregate(Avg('water_usage_m3'))['water_usage_m3__avg']
    }

    explosives_summary = {
        'total_value': explosives_data.aggregate(Sum('total_value'))['total_value__sum'],
        'latest_inventory': {
            'anfo': explosives_data.last().anfo_kg if explosives_data else 0,
            'emulsion': explosives_data.last().emulsion_kg if explosives_data else 0,
        }
    }

    stockpile_summary = {
        'total_ore': stockpile_data.aggregate(Sum('ore_tons'))['ore_tons__sum'],
        'total_waste': stockpile_data.aggregate(Sum('waste_tons'))['waste_tons__sum'],
        'avg_grade': stockpile_data.aggregate(Avg('grade_gpt'))['grade_gpt__avg']
    }

    expenses_summary = {
        'total': expenses_data.aggregate(Sum('amount'))['amount__sum']
    }

    energy_summary = {
        'total_cost': energy_data.aggregate(Sum('total_cost'))['total_cost__sum'],
        'avg_daily_consumption': energy_data.aggregate(Avg('electricity_kwh'))['electricity_kwh__avg']
    }

    chemicals_summary = {
        'total_cost': chemicals_data.aggregate(Sum('total_cost'))['total_cost__sum']
    }

    response_data = {
        'labor': labor_data,
        'production': {
            'data': list(production_data),
            'summary': production_summary
        },
        'safety': {
            'incidents': list(safety_data),
            'summary': safety_summary
        },
        'equipment': {
            'data': list(equipment_data),
            'summary': equipment_summary
        },
        'explosives': {
            'data': ExplosivesInventorySerializer(explosives_data, many=True).data,
            'summary': explosives_summary
        },
        'stockpile': {
            'daily_data': StockpileVolumeSerializer(stockpile_data, many=True).data,
            'summary': stockpile_summary
        },
        'expenses': {
            'data': DailyExpenseSerializer(expenses_data, many=True).data,
            'summary': expenses_summary
        },
        'environmental': {
            'data': list(environmental_data),
            'summary': environmental_summary
        },
        'energy': {
            'data': list(energy_data.values(
                'date',
                'electricity_kwh',
                'electricity_cost',
                'diesel_liters',
                'diesel_cost',
                'total_cost'
            )),
            'summary': energy_summary
        },
        'chemicals': {
            'data': list(chemicals_data.values(
                'date',
                'chemical__name',
                'quantity_used',
                'total_cost'
            )),
            'summary': chemicals_summary
        }
    }

    return Response(response_data)

@api_view(['GET'])
@permission_classes([AllowAny])  # For development, change to [IsAuthenticated] for production
@extend_schema(
    summary="Get dashboard data",
    description="Retrieve comprehensive mining operations data for the dashboard.",
    parameters=[
        OpenApiParameter(
            name='from_date',
            type=OpenApiTypes.DATE,
            location=OpenApiParameter.QUERY,
            description='Start date for filtering data (YYYY-MM-DD)',
            required=False
        ),
        OpenApiParameter(
            name='to_date',
            type=OpenApiTypes.DATE,
            location=OpenApiParameter.QUERY,
            description='End date for filtering data (YYYY-MM-DD)',
            required=False
        )
    ]
)
def dashboard_data_dev(request):
    # Get date range from query parameters
    from_date_str = request.GET.get('from_date')
    to_date_str = request.GET.get('to_date')

    try:
        if from_date_str and to_date_str:
            from_date = datetime.strptime(from_date_str, '%Y-%m-%d').date()
            to_date = datetime.strptime(to_date_str, '%Y-%m-%d').date()
        else:
            # Default to last 30 days if no dates provided
            to_date = timezone.now().date()
            from_date = to_date - timedelta(days=30)

        # Sample data for development
        dashboard_data = {
            "production": {
                "data": [],
                "summary": {
                    "avg_tonnage_crushed": 1500.5,
                    "avg_recovery_rate": 92.5,
                    "total_tonnage": 45000
                }
            },
            "safety": {
                "data": [],
                "summary": {
                    "total_incidents": 3,
                    "critical_incidents": 0,
                    "high_severity": 1
                }
            },
            "equipment": {
                "data": [],
                "summary": {
                    "operational_count": 25,
                    "maintenance_count": 5
                }
            },
            "explosives": {
                "data": [],
                "summary": {
                    "total_value": 150000,
                    "latest_inventory": {
                        "anfo": 5000,
                        "emulsion": 3000
                    }
                }
            },
            "stockpile": {
                "data": [],
                "summary": {
                    "total_ore": 75000,
                    "total_waste": 225000,
                    "avg_grade": 2.5
                }
            },
            "expenses": {
                "data": [],
                "summary": {
                    "total": 2500000
                }
            },
            "labor": {
                "data": [],
                "departments": [],
                "summary": {
                    "total_workers": 100,
                    "avg_attendance": 85,
                    "avg_productivity": 90,
                    "total_incidents": 2,
                    "trend_attendance": 5,
                    "trend_productivity": 10,
                    "trend_incidents": -20
                }
            },
            "environmental": {
                "data": [],
                "summary": {
                    "avg_dust": 45.2,
                    "avg_noise": 72.5,
                    "avg_water_usage": 15000
                }
            },
            "energy": {
                "data": [],
                "summary": {
                    "total_cost": 350000,
                    "avg_daily_consumption": 25000
                }
            },
            "chemicals": {
                "data": [],
                "summary": {
                    "total_cost": 180000
                }
            }
        }

        return Response(dashboard_data)

    except Exception as e:
        return Response(
            {"error": str(e)},
            status=500
        )

@extend_schema(
    summary="Get energy usage data",
    parameters=[
        OpenApiParameter(
            name='from_date',
            type=OpenApiTypes.DATE,
            location=OpenApiParameter.QUERY,
            description='Start date for filtering data (YYYY-MM-DD)',
            required=False
        ),
        OpenApiParameter(
            name='to_date',
            type=OpenApiTypes.DATE,
            location=OpenApiParameter.QUERY,
            description='End date for filtering data (YYYY-MM-DD)',
            required=False
        )
    ]
)
@api_view(['GET'])
@permission_classes([AllowAny])
def energy_usage(request):
    try:
        from_date = request.query_params.get('from_date')
        to_date = request.query_params.get('to_date')
        
        if from_date:
            from_date = date.fromisoformat(from_date)
        else:
            from_date = timezone.now().date() - timedelta(days=30)
            
        if to_date:
            to_date = date.fromisoformat(to_date)
        else:
            to_date = timezone.now().date()
    except ValueError:
        return Response({"error": "Invalid date format. Use YYYY-MM-DD"}, status=400)

    energy_data = EnergyUsage.objects.filter(
        date__range=[from_date, to_date]
    ).order_by('date')

    data = energy_data.values(
        'date',
        'electricity_kwh',
        'electricity_cost',
        'diesel_liters',
        'diesel_cost',
        'total_cost'
    )

    summary = {
        'total_electricity_kwh': energy_data.aggregate(Sum('electricity_kwh'))['electricity_kwh__sum'],
        'total_electricity_cost': energy_data.aggregate(Sum('electricity_cost'))['electricity_cost__sum'],
        'total_diesel_liters': energy_data.aggregate(Sum('diesel_liters'))['diesel_liters__sum'],
        'total_diesel_cost': energy_data.aggregate(Sum('diesel_cost'))['diesel_cost__sum'],
        'total_cost': energy_data.aggregate(Sum('total_cost'))['total_cost__sum'],
        'avg_daily_consumption': energy_data.aggregate(Avg('electricity_kwh'))['electricity_kwh__avg']
    }

    return Response({
        'data': list(data),
        'summary': summary
    })

@extend_schema(
    summary="Get chemicals usage data",
    parameters=[
        OpenApiParameter(
            name='from_date',
            type=OpenApiTypes.DATE,
            location=OpenApiParameter.QUERY,
            description='Start date for filtering data (YYYY-MM-DD)',
            required=False
        ),
        OpenApiParameter(
            name='to_date',
            type=OpenApiTypes.DATE,
            location=OpenApiParameter.QUERY,
            description='End date for filtering data (YYYY-MM-DD)',
            required=False
        )
    ]
)
@api_view(['GET'])
@permission_classes([AllowAny])
def chemicals_usage(request):
    try:
        from_date = request.query_params.get('from_date')
        to_date = request.query_params.get('to_date')
        
        if from_date:
            from_date = date.fromisoformat(from_date)
        else:
            from_date = timezone.now().date() - timedelta(days=30)
            
        if to_date:
            to_date = date.fromisoformat(to_date)
        else:
            to_date = timezone.now().date()
    except ValueError:
        return Response({"error": "Invalid date format. Use YYYY-MM-DD"}, status=400)

    chemicals_data = DailyChemicalsUsed.objects.filter(
        date__range=[from_date, to_date]
    ).order_by('date')

    data = chemicals_data.values(
        'date',
        'chemical__name',
        'quantity_used',
        'total_cost',
        'department__name'
    )

    summary = {
        'total_cost': chemicals_data.aggregate(Sum('total_cost'))['total_cost__sum'],
        'total_quantity': chemicals_data.aggregate(Sum('quantity_used'))['quantity_used__sum'],
        'chemicals_used': list(chemicals_data.values('chemical__name').distinct()),
        'departments': list(chemicals_data.values('department__name').distinct())
    }

    return Response({
        'data': list(data),
        'summary': summary
    })

@extend_schema(
    summary="Get gold production data",
    description="Retrieve, create, update, or delete gold production data.",
    parameters=[
        OpenApiParameter(
            name='from_date',
            type=OpenApiTypes.DATE,
            location=OpenApiParameter.QUERY,
            description='Start date for filtering data (YYYY-MM-DD)',
            required=False
        ),
        OpenApiParameter(
            name='to_date',
            type=OpenApiTypes.DATE,
            location=OpenApiParameter.QUERY,
            description='End date for filtering data (YYYY-MM-DD)',
            required=False
        )
    ]
)
@api_view(['GET', 'POST', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def gold_production(request):
    if request.method == 'GET':
        try:
            # Log request details
            logger.info(f"Gold production GET request received")
            logger.info(f"Request headers: {request.headers}")
            logger.info(f"Request user: {request.user}")
            
            # Get date range from query parameters
            from_date = request.query_params.get('from_date')
            to_date = request.query_params.get('to_date')
            
            logger.info(f"Received date range: from_date={from_date}, to_date={to_date}")

            # If no dates provided, use last 30 days
            if not from_date or not to_date:
                to_date = timezone.now().date()
                from_date = to_date - timedelta(days=30)
                logger.info(f"Using default date range: from_date={from_date}, to_date={to_date}")
            else:
                try:
                    from_date = datetime.strptime(from_date, '%Y-%m-%d').date()
                    to_date = datetime.strptime(to_date, '%Y-%m-%d').date()
                    logger.info(f"Parsed date range: from_date={from_date}, to_date={to_date}")
                except ValueError as e:
                    logger.error(f"Date parsing error: {str(e)}")
                    return Response(
                        {"error": "Invalid date format. Use YYYY-MM-DD"}, 
                        status=400
                    )

            # Query gold production data
            logger.info(f"Querying DailyProductionLog for date range")
            try:
                gold_data = DailyProductionLog.objects.filter(
                    date__gte=from_date,
                    date__lte=to_date
                ).order_by('date')
            except Exception as e:
                logger.error(f"Database query error: {str(e)}")
                return Response(
                    {"error": "Failed to query production data"}, 
                    status=500
                )

            logger.info(f"Found {gold_data.count()} records")
            if gold_data.count() == 0:
                logger.warning(f"No records found for date range {from_date} to {to_date}")
                return Response({
                    'data': [],
                    'summary': {
                        'total_smelted_gold': 0,
                        'avg_recovery_rate': 0,
                        'avg_efficiency': 0,
                        'total_tonnage_crushed': 0,
                        'total_tonnage_hoisted': 0,
                        'total_gross_profit': 0,
                        'avg_gold_price': 0
                    }
                })

            # Calculate daily totals and summaries
            daily_data = []
            total_tonnage_crushed = 0
            total_tonnage_hoisted = 0
            total_smelted_gold = 0
            total_gross_profit = 0
            avg_recovery = 0
            avg_efficiency = 0
            avg_gold_price = 0

            for record in gold_data:
                try:
                    logger.debug(f"Processing record for date {record.date}")
                    
                    # Safely convert Decimal to float with error handling
                    def safe_float(value, default=0.0):
                        try:
                            return float(value) if value is not None else default
                        except (TypeError, ValueError):
                            logger.warning(f"Failed to convert {value} to float, using default {default}")
                            return default

                    record_data = {
                        'date': record.date,
                        'total_tonnage_crushed': safe_float(record.total_tonnage_crushed),
                        'total_tonnage_hoisted': safe_float(record.total_tonnage_hoisted),
                        'total_tonnage_milled': safe_float(record.total_tonnage_milled),
                        'gold_recovery_rate': safe_float(record.gold_recovery_rate),
                        'operational_efficiency': safe_float(record.operational_efficiency),
                        'smelted_gold': safe_float(record.smelted_gold),
                        'gold_price': safe_float(record.gold_price),
                        'gross_profit': safe_float(record.gross_profit),
                        'notes': record.notes or ''
                    }
                    
                    daily_data.append(record_data)
                    
                    # Update totals
                    total_tonnage_crushed += record_data['total_tonnage_crushed']
                    total_tonnage_hoisted += record_data['total_tonnage_hoisted']
                    total_smelted_gold += record_data['smelted_gold']
                    total_gross_profit += record_data['gross_profit']
                    avg_recovery += record_data['gold_recovery_rate']
                    avg_efficiency += record_data['operational_efficiency']
                    avg_gold_price += record_data['gold_price']
                    
                except Exception as e:
                    logger.error(f"Error processing record {record.date}: {str(e)}", exc_info=True)
                    logger.error(f"Record data: {vars(record)}")
                    continue

            record_count = len(daily_data)
            logger.info(f"Successfully processed {record_count} records")

            if record_count == 0:
                logger.warning("No valid records found for the date range")
                return Response({
                    'data': [],
                    'summary': {
                        'total_smelted_gold': 0,
                        'avg_recovery_rate': 0,
                        'avg_efficiency': 0,
                        'total_tonnage_crushed': 0,
                        'total_tonnage_hoisted': 0,
                        'total_gross_profit': 0,
                        'avg_gold_price': 0
                    }
                })

            try:
                response_data = {
                    'data': daily_data,
                    'summary': {
                        'total_smelted_gold': round(total_smelted_gold, 2),
                        'avg_recovery_rate': round(avg_recovery / record_count if record_count > 0 else 0, 2),
                        'avg_efficiency': round(avg_efficiency / record_count if record_count > 0 else 0, 2),
                        'total_tonnage_crushed': round(total_tonnage_crushed, 2),
                        'total_tonnage_hoisted': round(total_tonnage_hoisted, 2),
                        'total_gross_profit': round(total_gross_profit, 2),
                        'avg_gold_price': round(avg_gold_price / record_count if record_count > 0 else 0, 2)
                    }
                }
                logger.info(f"Returning response with {len(daily_data)} records")
                logger.debug(f"Response data: {response_data}")
                return Response(response_data)
            except Exception as e:
                logger.error(f"Error creating response data: {str(e)}", exc_info=True)
                return Response(
                    {"error": "Failed to process production data"}, 
                    status=500
                )
                
        except Exception as e:
            logger.error(f"Unexpected error in gold_production GET: {str(e)}", exc_info=True)
            return Response(
                {"error": "An unexpected error occurred while fetching gold production data"}, 
                status=500
            )

    elif request.method == 'POST':
        try:
            date = request.data.get('date')
            if not date:
                return Response({'error': 'Date is required'}, status=400)

            # Check if record already exists
            if DailyProductionLog.objects.filter(date=date).exists():
                return Response({'error': 'Record for this date already exists'}, status=400)

            # Create new record with all required fields
            record = DailyProductionLog.objects.create(
                date=date,
                total_tonnage_crushed=request.data.get('total_tonnage_crushed', 0),
                total_tonnage_hoisted=request.data.get('total_tonnage_hoisted', 0),
                total_tonnage_milled=request.data.get('total_tonnage_milled', 0),
                gold_recovery_rate=request.data.get('gold_recovery_rate', 0),
                operational_efficiency=request.data.get('operational_efficiency', 0),
                smelted_gold=request.data.get('smelted_gold', 0),
                gold_price=request.data.get('gold_price', 0),
                gross_profit=request.data.get('gross_profit', 0),
                notes=request.data.get('notes', '')
            )
            return Response({
                'message': 'Record created successfully',
                'date': record.date
            }, status=201)
        except Exception as e:
            logger.error(f"Error in gold_production POST: {str(e)}", exc_info=True)
            return Response({'error': str(e)}, status=400)

    elif request.method == 'PUT':
        try:
            date = request.data.get('date')
            if not date:
                return Response({'error': 'Date is required'}, status=400)

            record = DailyProductionLog.objects.get(date=date)
            
            # Update fields
            record.total_tonnage_crushed = request.data.get('total_tonnage_crushed', record.total_tonnage_crushed)
            record.total_tonnage_hoisted = request.data.get('total_tonnage_hoisted', record.total_tonnage_hoisted)
            record.total_tonnage_milled = request.data.get('total_tonnage_milled', record.total_tonnage_milled)
            record.gold_recovery_rate = request.data.get('gold_recovery_rate', record.gold_recovery_rate)
            record.operational_efficiency = request.data.get('operational_efficiency', record.operational_efficiency)
            record.smelted_gold = request.data.get('smelted_gold', record.smelted_gold)
            record.gold_price = request.data.get('gold_price', record.gold_price)
            record.gross_profit = request.data.get('gross_profit', record.gross_profit)
            record.notes = request.data.get('notes', record.notes)
            
            record.save()
            
            return Response({
                'message': 'Record updated successfully',
                'date': record.date
            })
        except DailyProductionLog.DoesNotExist:
            return Response({'error': 'Record not found'}, status=404)
        except Exception as e:
            logger.error(f"Error in gold_production PUT: {str(e)}", exc_info=True)
            return Response({'error': str(e)}, status=400)

    elif request.method == 'DELETE':
        try:
            date = request.data.get('date')
            if not date:
                return Response({'error': 'Date is required'}, status=400)

            record = DailyProductionLog.objects.get(date=date)
            record.delete()
            return Response({
                'message': 'Record deleted successfully'
            })
        except DailyProductionLog.DoesNotExist:
            return Response({'error': 'Record not found'}, status=404)
        except Exception as e:
            logger.error(f"Error in gold_production DELETE: {str(e)}", exc_info=True)
            return Response({'error': str(e)}, status=400)

@extend_schema(
    summary="Get equipment maintenance data",
    description="Retrieve maintenance logs for both heavy machinery and gold milling equipment with date filtering.",
    parameters=[
        OpenApiParameter(
            name='from_date',
            type=OpenApiTypes.DATE,
            location=OpenApiParameter.QUERY,
            description='Start date for filtering data (YYYY-MM-DD)',
            required=False
        ),
        OpenApiParameter(
            name='to_date',
            type=OpenApiTypes.DATE,
            location=OpenApiParameter.QUERY,
            description='End date for filtering data (YYYY-MM-DD)',
            required=False
        ),
        OpenApiParameter(
            name='equipment_type',
            type=OpenApiTypes.STR,
            location=OpenApiParameter.QUERY,
            description='Filter by equipment type (heavy_machinery or milling)',
            required=False
        )
    ]
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def equipment_maintenance(request):
    try:
        from_date = request.query_params.get('from_date')
        to_date = request.query_params.get('to_date')
        equipment_type = request.query_params.get('equipment_type')
        
        if from_date:
            from_date = date.fromisoformat(from_date)
        else:
            from_date = timezone.now().date() - timedelta(days=30)
            
        if to_date:
            to_date = date.fromisoformat(to_date)
        else:
            to_date = timezone.now().date()
    except ValueError:
        return Response({"error": "Invalid date format. Use YYYY-MM-DD"}, status=400)

    # Base query
    maintenance_logs = EquipmentMaintenanceLog.objects.filter(
        maintenance_date__range=[from_date, to_date]
    )

    # Apply equipment type filter if specified
    if equipment_type:
        if equipment_type == 'heavy_machinery':
            maintenance_logs = maintenance_logs.filter(heavy_machinery__isnull=False)
        elif equipment_type == 'milling':
            maintenance_logs = maintenance_logs.filter(milling_equipment__isnull=False)

    # Get maintenance data
    maintenance_data = maintenance_logs.values(
        'maintenance_date',
        'maintenance_type',
        'description',
        'cost',
        'downtime_hours',
        'technician',
        'next_maintenance_date',
        'heavy_machinery__name',
        'milling_equipment__name'
    ).order_by('maintenance_date')

    # Calculate summary statistics
    summary = {
        'total_maintenance_count': maintenance_logs.count(),
        'total_cost': maintenance_logs.aggregate(total_cost=Sum('cost'))['total_cost'] or 0,
        'total_downtime_hours': maintenance_logs.aggregate(total_downtime=Sum('downtime_hours'))['total_downtime'] or 0,
        'avg_cost_per_maintenance': maintenance_logs.aggregate(avg_cost=Avg('cost'))['avg_cost'] or 0,
        'avg_downtime_hours': maintenance_logs.aggregate(avg_downtime=Avg('downtime_hours'))['avg_downtime'] or 0
    }

    return Response({
        'data': list(maintenance_data),
        'summary': summary
    })
