import axios from 'axios';
import { format } from 'date-fns';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add a request interceptor to add the token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh');
        const response = await axios.post(`${API_URL}/token/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = response.data;
        localStorage.setItem('token', access);

        originalRequest.headers.Authorization = `Bearer ${access}`;
        return axios(originalRequest);
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('refresh');
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export const authService = {
  login: async (username: string, password: string) => {
    try {
      const response = await api.post('/token/', { 
        username, 
        password 
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      const { access, refresh } = response.data;
      localStorage.setItem('token', access);
      localStorage.setItem('refresh', refresh);
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  register: async (userData: any) => {
    try {
      const response = await api.post('/register/', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh');
  },
};

export interface DailyLog {
  date: string;
  shift: string;
  production: number;  // in grams
  safety_incidents: number;
}

export interface ChemicalInventory {
  id: number;
  name: string;
  current_stock: number;  // in kg
  minimum_required: number;  // in kg
  unit: string;
  unit_price: number;  // in $
}

export interface SafetyIncident {
  id: number;
  date: string;
  incident_type: string;
  severity: string;
  description: string;
  department?: string;
  zone?: string;
  investigation_status: string;
  corrective_actions?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SafetyData {
  summary: {
    total_incidents: number;
    severity_counts: {
      low: number;
      medium: number;
      high: number;
      critical: number;
    };
    type_counts: Record<string, number>;
    status_counts: Record<string, number>;
    trend_percentage: number;
  };
  department_stats: Array<{
    department: string;
    total_incidents: number;
    severity_breakdown: Record<string, number>;
    type_breakdown: Record<string, number>;
  }>;
  recent_incidents: SafetyIncident[];
}

export interface ExplosiveInventory {
  id: number;
  name: string;
  type: string;
  current_stock: number;  // in kg
  unit_price: number;  // in $
}

export interface DailyExpense {
  date: string;
  energy_cost: number;  // in $
  chemical_cost: number;  // in $
  labor_cost: number;  // in $
  maintenance_cost: number;  // in $
  total_cost: number;  // in $
}

export interface LaborMetrics {
  date: string;
  total_workers: number;
  total_hours: number;
  hourly_rate: number;  // in $
  total_cost: number;  // in $
}

export interface EnvironmentalMetrics {
  date: string;
  water_usage: number;  // in cubic meters
  carbon_emissions: number;  // in metric tons
  waste_generated: number;  // in metric tons
  noise_level: number;  // in decibels
}

interface ExplosivesInventory {
  date: string;
  anfo_kg: number;
  emulsion_kg: number;
  detonators_count: number;
  boosters_count: number;
  total_value: number;
}

interface DailyExpense {
  date: string;
  category: string;
  amount: number;
  description: string;
}

interface LaborMetric {
  date: string;
  shift: string;
  workers_present: number;
  hours_worked: number;
  overtime_hours: number;
  productivity_index: number;
  safety_incidents: number;
}

interface EnvironmentalMetric {
  date: string;
  dust_level_pm10: number;
  noise_level_db: number;
  water_usage_m3: number;
  rehabilitation_area_m2: number;
  waste_water_ph: number;
}

export interface EnergyUsage {
  date: string;
  electricity_kwh: number;
  electricity_cost: number;
  diesel_liters: number;
  diesel_cost: number;
  total_cost: number;
}

export interface EnergyData {
  data: EnergyUsage[];
  summary: {
    avg_electricity_kwh: number;
    avg_electricity_cost: number;
    avg_diesel_liters: number;
    avg_diesel_cost: number;
    avg_total_cost: number;
    trend_electricity: number;
    trend_diesel: number;
    trend_cost: number;
  };
}

export interface ProductionData {
  data: Array<{
    date: string;
    total_tonnage_crushed: number;
    total_tonnage_hoisted: number;
    gold_recovery_rate: number;
    operational_efficiency: number;
  }>;
  summary: {
    avg_tonnage_crushed: number;
    avg_tonnage_hoisted: number;
    avg_recovery_rate: number;
    avg_efficiency: number;
    trend_tonnage_crushed: number;
    trend_recovery_rate: number;
  };
}

export interface DashboardData {
  production: ProductionData;
  safety: SafetyData;
  explosives: ExplosivesData;
  stockpile: StockpileData;
  expenses: ExpensesData;
  labor: LaborData;
  environmental: EnvironmentalData;
  energy: EnergyData;
  chemicals: ChemicalData;
}

export interface ChemicalUsage {
  date: string;
  chemical_name: string;
  quantity_used: number;
  unit_of_measurement: string;
  total_cost: number;
  department: string;
}

export interface ChemicalData {
  data: ChemicalUsage[];
  summary: {
    total_cost: number;
    most_used_chemical: string;
    avg_daily_cost: number;
    cost_trend: number;
  };
}

interface DateRangeParams {
  from_date: string;
  to_date: string;
}

import { GoldProductionResponse } from '../types/goldProduction';
import { Department, DepartmentFormData } from '../types/department';

export const fetchGoldProductionData = async (dateRange: DateRangeParams): Promise<GoldProductionResponse> => {
  const { data } = await api.get<GoldProductionResponse>(
    `/mining-operations/gold-production/?from_date=${dateRange.from_date}&to_date=${dateRange.to_date}`,
  );
  return data;
};

export const fetchDashboardData = async (params: DateRangeParams) => {
  const response = await api.get(`/mining-operations/dashboard-data/?from_date=${params.from_date}&to_date=${params.to_date}`);
  return response.data;
};

export const fetchDailyLogs = async (params: DateRangeParams) => {
  const response = await api.get(`/daily-logs/?from_date=${params.from_date}&to_date=${params.to_date}`);
  return response.data;
};

export const fetchChemicalInventory = async (params: DateRangeParams) => {
  const response = await api.get(`/chemical-inventory/?from_date=${params.from_date}&to_date=${params.to_date}`);
  return response.data;
};

export const fetchSafetyIncidents = async (params: DateRangeParams) => {
  const response = await api.get(`/safety-incidents/?from_date=${params.from_date}&to_date=${params.to_date}`);
  return response.data;
};

export const fetchEnergyUsage = async (params: DateRangeParams) => {
  const response = await api.get(`/energy-usage/?from_date=${params.from_date}&to_date=${params.to_date}`);
  return response.data;
};

export const fetchProductionMetrics = async (params: DateRangeParams) => {
  const response = await api.get(`/production-metrics/?from_date=${params.from_date}&to_date=${params.to_date}`);
  return response.data;
};

export const fetchGoldProduction = async ({ from_date, to_date }: DateRangeParams) => {
  console.log('API Service - Fetching gold production data:', { from_date, to_date });
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('API Service - No authentication token found');
      throw new Error('No authentication token found');
    }

    const response = await api.get<GoldProductionResponse>(
      `/mining-operations/gold-production/`,
      {
        params: { from_date, to_date },
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!response.data) {
      console.error('API Service - No data in response');
      throw new Error('No data returned from server');
    }

    // Validate response data structure
    const data = response.data;
    if (!Array.isArray(data.data)) {
      console.error('API Service - Invalid data format:', data);
      throw new Error('Invalid data format received from server');
    }

    // Validate summary data
    if (!data.summary || typeof data.summary !== 'object') {
      console.error('API Service - Invalid summary format:', data);
      throw new Error('Invalid summary format received from server');
    }

    console.log('API Service - Gold production response:', response.data);
    return response.data;
  } catch (error) {
    console.error('API Service - Gold production error:', error);
    if (axios.isAxiosError(error)) {
      console.error('API Service - Response details:', {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers
      });
      
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('refresh');
        throw new Error('Your session has expired. Please log in again.');
      } else if (error.response?.status === 500) {
        if (error.response.data?.error) {
          throw new Error(error.response.data.error);
        } else {
          throw new Error('Server error. Please try again later or contact support if the problem persists.');
        }
      } else if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
    }
    throw error;
  }
};

export const fetchChemicalsUsage = async (params: DateRangeParams) => {
  const response = await api.get(`/mining-operations/chemicals-usage/?from_date=${params.from_date}&to_date=${params.to_date}`);
  return response.data;
};

export interface DailyStockpileData {
  date: string;
  site: string;
  crushed_stockpile_volume: number;
  milled_stockpile_volume: number;
}

export interface StockpileSummary {
  total_stockpiles: number;
  total_crushed_volume: number;
  total_milled_volume: number;
  overall_utilization: number;
  site_breakdown: {
    [key: string]: {
      crushed_volume: number;
      milled_volume: number;
    };
  };
}

export interface StockpileResponse {
  stockpiles: DailyStockpileData[];
  summary: StockpileSummary;
}

export const fetchStockpileData = async (params: DateRangeParams): Promise<StockpileResponse> => {
  try {
    const response = await api.get('/stockpile-volumes/', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching stockpile data:', error);
    throw error;
  }
};

export const dashboardService = {
  // Get daily production logs
  getDailyLogs: async () => {
    try {
      const response = await api.get<{ logs: DailyLog[], summary: any }>('/mining/daily-logs/');
      return response.data;
    } catch (error) {
      console.error('Error fetching daily logs:', error);
      throw error;
    }
  },

  // Get chemical inventory
  getChemicals: async () => {
    try {
      const response = await api.get<{ chemicals: ChemicalInventory[], summary: any }>('/dashboard/chemicals/');
      return response.data;
    } catch (error) {
      console.error('Error fetching chemical inventory:', error);
      throw error;
    }
  },

  // Get safety incidents and summary
  getSafetyIncidents: async () => {
    try {
      const response = await api.get<{ incidents: SafetyIncident[], summary: any }>('/dashboard/safety/');
      return response.data;
    } catch (error) {
      console.error('Error fetching safety incidents:', error);
      throw error;
    }
  },

  // Get explosives inventory
  getExplosives: async () => {
    try {
      const response = await api.get<{ explosives: ExplosiveInventory[], summary: any }>('/dashboard/explosives/');
      return response.data;
    } catch (error) {
      console.error('Error fetching explosives inventory:', error);
      throw error;
    }
  },

  // Get stockpile volumes
  getStockpile: async () => {
    try {
      const response = await api.get<{ data: DailyStockpileData[], summary: StockpileSummary }>('/dashboard/stockpile/');
      return response.data;
    } catch (error) {
      console.error('Error fetching stockpile volumes:', error);
      throw error;
    }
  },

  // Get daily expenses
  getExpenses: async () => {
    try {
      const response = await api.get<{ data: DailyExpense[], summary: any }>('/dashboard/expenses/');
      return response.data;
    } catch (error) {
      console.error('Error fetching daily expenses:', error);
      throw error;
    }
  },

  // Get labor metrics
  getLaborMetrics: async () => {
    try {
      const response = await api.get<{ data: LaborMetrics[], summary: any }>('/dashboard/labor/');
      return response.data;
    } catch (error) {
      console.error('Error fetching labor metrics:', error);
      throw error;
    }
  },

  // Get environmental metrics
  getEnvironmentalMetrics: async () => {
    try {
      const response = await api.get<{ data: EnvironmentalMetrics[], summary: any }>('/dashboard/environmental/');
      return response.data;
    } catch (error) {
      console.error('Error fetching environmental metrics:', error);
      throw error;
    }
  },

  // Get energy usage data
  async getEnergyUsage(startDate: Date, endDate: Date): Promise<EnergyData> {
    try {
      const formattedStartDate = format(startDate, 'yyyy-MM-dd');
      const formattedEndDate = format(endDate, 'yyyy-MM-dd');
      
      const response = await api.get('/energy-usage/', {
        params: {
          from_date: formattedStartDate,
          to_date: formattedEndDate,
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching energy usage:', error);
      throw error;
    }
  },

  // Get chemicals usage data
  async getChemicalsUsage(startDate: Date, endDate: Date): Promise<ChemicalData> {
    try {
      const formattedStartDate = format(startDate, 'yyyy-MM-dd');
      const formattedEndDate = format(endDate, 'yyyy-MM-dd');
      
      const response = await api.get('/mining-operations/chemicals-usage/', {
        params: {
          from_date: formattedStartDate,
          to_date: formattedEndDate,
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching chemicals usage:', error);
      throw error;
    }
  },

  // Get dashboard data
  async getDashboardData({ from_date, to_date }: DateRangeParams): Promise<DashboardData> {
    try {
      const response = await api.get('/mining-operations/dashboard-data/', {
        params: { from_date, to_date }
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  },

  getDashboardData: async (params: DateRangeParams): Promise<DashboardData> => {
    try {
      const response = await api.get('/mining-operations/dashboard-data/', {
        params: params
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  },

  getEnergyUsage: async (params: DateRangeParams) => {
    try {
      const response = await api.get('/energy-usage/', {
        params: params
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching energy usage data:', error);
      throw error;
    }
  },

  getChemicalsUsage: async (params: DateRangeParams) => {
    try {
      const response = await api.get('/mining-operations/chemicals-usage/', {
        params: params
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching chemicals usage data:', error);
      throw error;
    }
  },

  // Get safety incidents data
  getSafetyData: async ({ from_date, to_date, page = 0, rowsPerPage = 25 }: DateRangeParams & { page?: number; rowsPerPage?: number } = {}) => {
    try {
      const params = new URLSearchParams();
      if (from_date) params.append('from_date', from_date);
      if (to_date) params.append('to_date', to_date);
      params.append('offset', (page * rowsPerPage).toString());
      params.append('limit', rowsPerPage.toString());
      
      console.log('Fetching safety incidents with params:', {
        from_date,
        to_date,
        page,
        rowsPerPage,
        offset: page * rowsPerPage,
        limit: rowsPerPage
      });
      
      const response = await api.get(`/mining-operations/safety/?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching safety data:', error);
      throw error;
    }
  },
};

export const goldProductionService = {
  // Get gold production data
  getGoldProduction: async ({ from_date, to_date }: DateRangeParams) => {
    try {
      const params = new URLSearchParams();
      if (from_date) params.append('from_date', from_date);
      if (to_date) params.append('to_date', to_date);
      const response = await api.get(`/mining-operations/gold-production/?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching gold production data:', error);
      throw error;
    }
  },

  // Create new production record
  createRecord: async (data: any) => {
    try {
      const response = await api.post('/mining-operations/gold-production/create/', data);
      return response.data;
    } catch (error) {
      console.error('Error creating production record:', error);
      throw error;
    }
  },

  // Update production record
  updateRecord: async (data: any) => {
    try {
      const response = await api.put('/mining-operations/gold-production/update/', data);
      return response.data;
    } catch (error) {
      console.error('Error updating production record:', error);
      throw error;
    }
  },

  // Delete production record
  deleteRecord: async (date: string) => {
    try {
      const response = await api.delete(`/mining-operations/gold-production/delete/${date}/`);
      return response.data;
    } catch (error) {
      console.error('Error deleting production record:', error);
      throw error;
    }
  }
};

export const energyUsageService = {
  getEnergyUsage: async ({ from_date, to_date }: DateRangeParams) => {
    try {
      const params = new URLSearchParams();
      if (from_date) params.append('from_date', from_date);
      if (to_date) params.append('to_date', to_date);
      
      console.log('Fetching energy usage with params:', params.toString());
      const response = await api.get(`/mining-operations/energy-usage/?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching energy usage:', error);
      throw error;
    }
  },

  createEnergyUsage: async (data: any) => {
    try {
      console.log('Creating energy usage with data:', data);
      const response = await api.post('/mining-operations/energy-usage/create/', data);
      return response.data;
    } catch (error) {
      console.error('Error creating energy usage record:', error);
      if (error.response?.status === 400 && error.response?.data?.error) {
        // If it's a known error (like duplicate date), pass it through
        throw new Error(error.response.data.error);
      }
      throw error;
    }
  },

  updateEnergyUsage: async (data: any) => {
    try {
      // Calculate total cost
      const electricityCost = Number(data.electricity_cost);
      const dieselCost = Number(data.diesel_cost);
      const totalCost = electricityCost + dieselCost;

      const updateData = {
        ...data,
        electricity_kwh: Number(data.electricity_kwh),
        electricity_cost: electricityCost,
        diesel_liters: Number(data.diesel_liters),
        diesel_cost: dieselCost,
        total_cost: totalCost,
      };
      
      console.log('Sending update request with data:', updateData);
      const response = await api.put('/mining-operations/energy-usage/update/', updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating energy usage record:', error);
      if (error.response?.status === 400 && error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw error;
    }
  },

  deleteEnergyUsage: async (id: number) => {
    try {
      if (!id) {
        throw new Error('Record ID is required for deletion');
      }
      const response = await api.delete(`/mining-operations/energy-usage/delete/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error deleting energy usage record:', error);
      throw error;
    }
  }
};

export const safetyService = {
  // Get safety incidents data
  getSafetyIncidents: async ({ from_date, to_date, page = 0, rowsPerPage = 25 }: DateRangeParams & { page?: number; rowsPerPage?: number }) => {
    try {
      const params = new URLSearchParams();
      if (from_date) params.append('from_date', from_date);
      if (to_date) params.append('to_date', to_date);
      params.append('offset', (page * rowsPerPage).toString());
      params.append('limit', rowsPerPage.toString());
      
      console.log('Fetching safety incidents with params:', {
        from_date,
        to_date,
        page,
        rowsPerPage,
        offset: page * rowsPerPage,
        limit: rowsPerPage
      });
      
      const response = await api.get(`/mining-operations/safety/?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching safety incidents:', error);
      throw error;
    }
  },

  // Create new safety incident
  createIncident: async (data: Omit<SafetyIncident, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const response = await api.post('/mining-operations/safety/create/', data);
      return response.data;
    } catch (error) {
      console.error('Error creating safety incident:', error);
      throw error;
    }
  },

  // Update safety incident
  updateIncident: async (id: number, data: Partial<SafetyIncident>) => {
    try {
      // Use PUT method with ID in URL, following REST convention
      const response = await api.put(`/mining-operations/safety/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating safety incident:', error);
      throw error;
    }
  },

  // Delete safety incident
  deleteIncident: async (id: number) => {
    try {
      const response = await api.delete(`/mining-operations/safety/${id}/delete/`);
      return response.data;
    } catch (error) {
      console.error('Error deleting safety incident:', error);
      throw error;
    }
  },

  // Get all safety incidents for export
  getAllSafetyIncidents: async ({ from_date, to_date }: DateRangeParams) => {
    try {
      const params = new URLSearchParams();
      if (from_date) params.append('from_date', from_date);
      if (to_date) params.append('to_date', to_date);
      params.append('export', 'true'); // Signal to backend this is for export
      params.append('limit', '1000'); // Set a high limit to get all records
      
      console.log('Fetching all safety incidents for export:', {
        from_date,
        to_date,
        params: params.toString()
      });
      
      const response = await api.get(`/mining-operations/safety/?${params.toString()}`);
      console.log('Export response received:', {
        totalIncidents: response.data?.summary?.total_incidents,
        recordsCount: response.data?.recent_incidents?.length
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching all safety incidents:', error);
      throw error;
    }
  },
};

export const departmentService = {
  // Get all departments
  getDepartments: async (): Promise<Department[]> => {
    try {
      const response = await api.get('/mining-operations/get_departments/');
      return response.data;
    } catch (error) {
      console.error('Error fetching departments:', error);
      throw error;
    }
  },

  // Get a single department
  getDepartment: async (id: number): Promise<Department> => {
    try {
      const response = await api.get(`/mining-operations/departments/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching department:', error);
      throw error;
    }
  },

  // Create a department
  createDepartment: async (data: DepartmentFormData): Promise<Department> => {
    try {
      const response = await api.post('/mining-operations/departments/', data);
      return response.data;
    } catch (error) {
      console.error('Error creating department:', error);
      throw error;
    }
  },

  // Update a department
  updateDepartment: async (id: number, data: Partial<DepartmentFormData>): Promise<Department> => {
    try {
      const response = await api.put(`/mining-operations/departments/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating department:', error);
      throw error;
    }
  },

  // Delete a department
  deleteDepartment: async (id: number): Promise<void> => {
    try {
      await api.delete(`/mining-operations/departments/${id}/delete/`);
    } catch (error) {
      console.error('Error deleting department:', error);
      throw error;
    }
  }
};

export const chemicalService = {
  // Get all chemicals
  getChemicals: async (): Promise<Chemical[]> => {
    try {
      const response = await api.get('/chemicals/');
      return response.data;
    } catch (error) {
      console.error('Error fetching chemicals:', error);
      throw error;
    }
  },

  // Get a single chemical
  getChemical: async (id: number): Promise<Chemical> => {
    try {
      const response = await api.get(`/chemicals/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching chemical:', error);
      throw error;
    }
  },

  // Create a new chemical
  createChemical: async (data: ChemicalFormData): Promise<Chemical> => {
    try {
      const response = await api.post('/chemicals/', data);
      return response.data;
    } catch (error) {
      console.error('Error creating chemical:', error);
      throw error;
    }
  },

  // Update a chemical
  updateChemical: async (id: number, data: Partial<ChemicalFormData>): Promise<Chemical> => {
    try {
      const response = await api.patch(`/chemicals/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating chemical:', error);
      throw error;
    }
  },

  // Delete a chemical
  deleteChemical: async (id: number): Promise<void> => {
    try {
      await api.delete(`/chemicals/${id}/`);
    } catch (error) {
      console.error('Error deleting chemical:', error);
      throw error;
    }
  },
};

// Chemicals service for managing mining chemicals
export const chemicalsService = {
  // Get chemicals
  getChemicals: async () => {
    try {
      const response = await api.get('mining-operations/chemicals/');
      return response.data;
    } catch (error) {
      console.error('Error fetching chemicals:', error);
      throw error;
    }
  },

  // Create new chemical
  createChemical: async (data: any) => {
    try {
      const response = await api.post('mining-operations/chemicals/', data);
      return response.data;
    } catch (error) {
      console.error('Error creating chemical:', error);
      throw error;
    }
  },

  // Update chemical
  updateChemical: async (id: number, data: any) => {
    try {
      const response = await api.put(`mining-operations/chemicals/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating chemical:', error);
      throw error;
    }
  },

  // Delete chemical
  deleteChemical: async (id: number) => {
    try {
      await api.delete(`mining-operations/chemicals/${id}/`);
    } catch (error) {
      console.error('Error deleting chemical:', error);
      throw error;
    }
  }
};

// Equipment service for managing mining equipment
export const equipmentService = {
  // Get equipment
  getEquipment() {
    return api.get('/mining-operations/settings/equipment/').then((response) => response.data);
  },

  // Get departments
  getDepartments() {
    return api.get('/mining-operations/settings/departments/').then((response) => response.data);
  },

  // Create new equipment
  createEquipment(data: any) {
    const formData = {
      ...data,
      department: data.department_id  // Map department_id to department for API
    };
    return api.post('/mining-operations/settings/equipment/', formData).then((response) => response.data);
  },

  // Update equipment
  updateEquipment(id: number, data: any) {
    const formData = {
      ...data,
      department: data.department_id  // Map department_id to department for API
    };
    return api.put(`/mining-operations/settings/equipment/${id}/`, formData).then((response) => response.data);
  },

  // Delete equipment
  deleteEquipment(id: number) {
    return api.delete(`/mining-operations/settings/equipment/${id}/`);
  },
};

export const fetchExplosivesData = async (params: DateRangeParams) => {
  const response = await api.get('/explosives-data/', {
    params: {
      from_date: params.from_date,
      to_date: params.to_date
    }
  });
  return response.data;
};

export const fetchEquipmentStatus = async (params: DateRangeParams) => {
  return null;
};

export const zoneService = {
  // Get all zones
  getZones: async () => {
    try {
      const response = await api.get('/mining-operations/zones/');
      return response.data;
    } catch (error) {
      console.error('Error fetching zones:', error);
      throw error;
    }
  },

  // Create new zone
  createZone: async (data: any) => {
    try {
      const response = await api.post('/mining-operations/zones/create/', data);
      return response.data;
    } catch (error) {
      console.error('Error creating zone:', error);
      throw error;
    }
  },

  // Update zone
  updateZone: async (id: number, data: any) => {
    try {
      const response = await api.put(`/mining-operations/zones/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating zone:', error);
      throw error;
    }
  },

  // Delete zone
  deleteZone: async (id: number) => {
    try {
      const response = await api.delete(`/mining-operations/zones/${id}/delete/`);
      return response.data;
    } catch (error) {
      console.error('Error deleting zone:', error);
      throw error;
    }
  },
};

export default api;
