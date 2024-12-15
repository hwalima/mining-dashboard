import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { fetchWithAuth } from '../utils/api';
import { useDateFilterContext } from '../contexts/DateFilterContext';

interface EnergyData {
  date: string;
  electricity_kwh: number;
  electricity_cost: number;
  diesel_liters: number;
  diesel_cost: number;
  total_cost: number;
}

interface EnergySummary {
  total_electricity_kwh: number;
  total_electricity_cost: number;
  total_diesel_liters: number;
  total_diesel_cost: number;
  total_cost: number;
  avg_electricity_kwh: number;
  avg_electricity_cost: number;
  avg_diesel_liters: number;
  avg_diesel_cost: number;
  avg_total_cost: number;
  trend_electricity: number;
  trend_diesel: number;
  trend_cost: number;
}

interface EnergyResponse {
  data: EnergyData[];
  summary: EnergySummary;
}

export const useEnergyData = () => {
  const { dateRange } = useDateFilterContext();
  const fromDate = format(dateRange.startDate, 'yyyy-MM-dd');
  const toDate = format(dateRange.endDate, 'yyyy-MM-dd');

  return useQuery<EnergyResponse>({
    queryKey: ['energyUsage', fromDate, toDate],
    queryFn: () => fetchWithAuth(`/api/energy-usage/?from_date=${fromDate}&to_date=${toDate}`),
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
