export interface Department {
  id: number;
  name: string;
  type: 'extraction' | 'processing' | 'safety' | 'maintenance' | 'logistics' | 'administration';
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface DepartmentFormData {
  name: string;
  type: 'extraction' | 'processing' | 'safety' | 'maintenance' | 'logistics' | 'administration';
  description?: string;
}
