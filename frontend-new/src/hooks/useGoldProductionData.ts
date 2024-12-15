import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { fetchGoldProduction } from '../services/api';
import { useDateFilterContext } from '../contexts/DateFilterContext';

export interface GoldProductionData {
  date: string;
  total_tonnage_crushed: number;
  total_tonnage_hoisted: number;
  gold_recovery_rate: number;
  operational_efficiency: number;
  smelted_gold: number;
  gold_price: number;
  gross_profit: number;
}

export interface GoldProductionSummary {
  total_tonnage_crushed: number;
  total_tonnage_hoisted: number;
  avg_recovery_rate: number;
  avg_efficiency: number;
  total_smelted_gold: number;
  avg_gold_price: number;
  total_gross_profit: number;
}

export interface GoldProductionResponse {
  data: GoldProductionData[];
  summary: GoldProductionSummary;
}

export const useGoldProductionData = () => {
  const { dateRange, dateRangeType } = useDateFilterContext();
  const fromDate = format(dateRange.startDate, 'yyyy-MM-dd');
  const toDate = format(dateRange.endDate, 'yyyy-MM-dd');

  console.log('useGoldProductionData - Date Range:', { fromDate, toDate, dateRangeType });

  return useQuery<GoldProductionResponse>({
    queryKey: ['goldProduction', fromDate, toDate, dateRangeType],
    queryFn: async () => {
      console.log('useGoldProductionData - Fetching data...');
      try {
        const response = await fetchGoldProduction({ from_date: fromDate, to_date: toDate });
        console.log('useGoldProductionData - Response:', response);
        return response;
      } catch (error) {
        console.error('useGoldProductionData - Error:', error);
        throw error;
      }
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
