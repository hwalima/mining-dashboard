import { useQuery } from '@tanstack/react-query';
import { format, subDays } from 'date-fns';
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
  
  // If the selected date is in the future or we have no data for it,
  // default to the last 7 days up to today
  const today = new Date();
  const defaultEndDate = today;
  const defaultStartDate = subDays(today, 7);

  const fromDate = format(dateRange.startDate > today ? defaultStartDate : dateRange.startDate, 'yyyy-MM-dd');
  const toDate = format(dateRange.endDate > today ? defaultEndDate : dateRange.endDate, 'yyyy-MM-dd');

  console.log('Fetching chemicals data for date range:', { fromDate, toDate });

  return useQuery<ChemicalsResponse>({
    queryKey: ['chemicals', fromDate, toDate],
    queryFn: async () => {
      try {
        const url = `/api/dashboard/api/chemicals-usage/?from_date=${fromDate}&to_date=${toDate}`;
        console.log('Fetching chemicals data from:', url);
        const response = await fetchWithAuth(url);
        console.log('Chemicals data response:', response);
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
