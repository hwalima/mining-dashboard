export interface Widget {
  id: string;
  name: string;
  type: 'status' | 'chart' | 'metrics' | 'inventory';
  isVisible: boolean;
  description?: string;
}
