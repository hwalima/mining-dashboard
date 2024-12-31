export interface Zone {
  id: number;
  name: string;
  code: string;
  area_type: 'extraction' | 'processing' | 'storage' | 'maintenance' | 'office';
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  max_occupancy: number;
  requires_certification: boolean;
  site?: string;
}

export interface ZoneFormData {
  name: string;
  code: string;
  area_type: Zone['area_type'];
  risk_level: Zone['risk_level'];
  description: string;
  max_occupancy: number;
  requires_certification: boolean;
  site?: string;
}
