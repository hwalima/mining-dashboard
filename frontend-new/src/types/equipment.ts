export interface MaintenanceRecord {
  date: string;
  type: string;
  description: string;
  cost: number;
  duration_hours: number;
}

export interface Equipment {
  id: number;
  name: string;
  type: string;
  status: 'Operational' | 'Under Maintenance' | 'Out of Service';
  efficiency: number;
  last_maintenance: string;
  next_maintenance_due: string;
  operating_hours: number;
  maintenance_history: MaintenanceRecord[];
}

export interface EquipmentSummary {
  total_count: number;
  operational_count: number;
  maintenance_count: number;
  out_of_service_count: number;
  avg_efficiency: number;
  total_maintenance_cost: number;
  total_maintenance_hours: number;
  trend_efficiency: number;
  trend_maintenance_cost: number;
}

export interface EquipmentResponse {
  data: Equipment[];
  summary: EquipmentSummary;
}
