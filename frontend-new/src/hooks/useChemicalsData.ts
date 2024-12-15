import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { fetchWithAuth } from '../utils/api';
import { useDateFilterContext } from '../contexts/DateFilterContext';

interface ChemicalItem {
  name: string;
  amount_used: number;
  unit: string;
  value_used: number;
  current_stock: number;
  avg_daily_usage: number;
  status: 'Low' | 'Warning' | 'Normal';
}

interface ChemicalsSummary {
  total_chemicals: number;
  low_stock_count: number;
  warning_stock_count: number;
  total_value_used: number;
}

interface ChemicalsResponse {
  data: ChemicalItem[];
  summary: ChemicalsSummary;
}

const defaultChemicalsData: ChemicalsResponse = {
  data: [],
  summary: {
    total_chemicals: 0,
    low_stock_count: 0,
    warning_stock_count: 0,
    total_value_used: 0
  }
};

export const useChemicalsData = () => {
  const { dateRange } = useDateFilterContext();
  const fromDate = format(dateRange.startDate, 'yyyy-MM-dd');
  const toDate = format(dateRange.endDate, 'yyyy-MM-dd');

  return useQuery<ChemicalsResponse>({
    queryKey: ['chemicals', fromDate, toDate],
    queryFn: async () => {
      try {
        const response = await fetchWithAuth(`/api/chemicals-usage/?from_date=${fromDate}&to_date=${toDate}`);
        return response || defaultChemicalsData;
      } catch (error) {
        console.error('Error fetching chemicals data:', error);
        return defaultChemicalsData;
      }
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
