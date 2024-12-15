import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useDateFilterContext } from '../contexts/DateFilterContext';
import { fetchWithAuth } from '../utils/apiUtils';

export interface ExplosivesResponse {
  data: {
    date: string;
    explosive_name: string;
    amount_used: number;
    unit: string;
    blast_location: string;
    blast_purpose: string;
    effectiveness_rating: number | null;
    status: 'Low' | 'Warning' | 'Normal';
  }[];
  inventory: {
    id: number;
    name: string;
    type: string;
    current_stock: number;
    minimum_required: number;
    unit: string;
    last_restocked: string | null;
    status: 'Low' | 'Warning' | 'Normal';
  }[];
  summary: {
    total_explosives: number;
    low_stock_count: number;
    warning_stock_count: number;
    total_usage: { [key: string]: number };
    avg_effectiveness_rating: number;
    total_blasts: number;
  };
}

export const useExplosivesData = () => {
  const { dateRange } = useDateFilterContext();
  const fromDate = format(dateRange.startDate, 'yyyy-MM-dd');
  const toDate = format(dateRange.endDate, 'yyyy-MM-dd');

  return useQuery<ExplosivesResponse>({
    queryKey: ['explosives', fromDate, toDate],
    queryFn: () => fetchWithAuth(`/api/explosives-data/?from_date=${fromDate}&to_date=${toDate}`),
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
