import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { fetchWithAuth } from '../utils/api';
import { useDateFilterContext } from '../contexts/DateFilterContext';

interface ProductionData {
  date: string;
  total_tonnage_crushed: number;
  total_tonnage_hoisted: number;
  gold_recovery_rate: number;
  operational_efficiency: number;
}

interface ProductionSummary {
  avg_tonnage_crushed: number;
  avg_tonnage_hoisted: number;
  avg_recovery_rate: number;
  avg_efficiency: number;
  trend_tonnage_crushed: number;
  trend_recovery_rate: number;
}

interface ProductionResponse {
  data: ProductionData[];
  summary: ProductionSummary;
}

export const useProductionData = () => {
  const { dateRange } = useDateFilterContext();
  const fromDate = format(dateRange.startDate, 'yyyy-MM-dd');
  const toDate = format(dateRange.endDate, 'yyyy-MM-dd');

  return useQuery<ProductionResponse>({
    queryKey: ['productionMetrics', fromDate, toDate],
    queryFn: () => fetchWithAuth(`/api/production-metrics/?from_date=${fromDate}&to_date=${toDate}`),
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
