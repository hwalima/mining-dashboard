import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { fetchWithAuth } from '../utils/api';
import { useDateFilterContext } from '../contexts/DateFilterContext';
import { EquipmentResponse } from '../types/equipment';

interface MaintenanceRecord {
  date: string;
  type: string;
  description: string;
  cost: number;
  duration_hours: number;
}

interface EquipmentData {
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

interface EquipmentSummary {
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

export const useEquipmentData = () => {
  const { dateRange } = useDateFilterContext();
  const fromDate = format(dateRange.startDate, 'yyyy-MM-dd');
  const toDate = format(dateRange.endDate, 'yyyy-MM-dd');

  return useQuery<EquipmentResponse>({
    queryKey: ['equipmentStatus', fromDate, toDate],
    queryFn: async () => {
      try {
        const response = await fetchWithAuth(`/api/equipment-status/?from_date=${fromDate}&to_date=${toDate}`);
        return response;
      } catch (error) {
        console.error('Error fetching equipment data:', error);
        throw error;
      }
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};
