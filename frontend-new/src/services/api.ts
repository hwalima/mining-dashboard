import axios from 'axios';
import { format } from 'date-fns';

const API_URL = 'http://localhost:8000';

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
    // Add these headers for CORS
    config.headers['Access-Control-Allow-Origin'] = '*';
    config.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
    config.headers['Access-Control-Allow-Headers'] = 'Origin, Content-Type, Accept, Authorization, X-Request-With';
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
  type: string;
  description: string;
  date: string;
  severity: string;
  resolved: boolean;
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

export interface SafetyData {
  data: Array<{
    id: number;
    date: string;
    type: string;
    severity: string;
    description: string;
    corrective_actions: string;
  }>;
  summary: {
    total_incidents: number;
    days_without_incident: number;
    severity_breakdown: {
      low: number;
      medium: number;
      high: number;
      critical: number;
    };
  };
}

export interface ExplosivesData {
  data: Array<{
    date: string;
    anfo_kg: number;
    emulsion_kg: number;
    detonators_count: number;
    boosters_count: number;
    total_value: number;
  }>;
  summary: {
    total_value: number;
    latest_inventory: {
      anfo: number;
      emulsion: number;
    };
  };
}

export interface StockpileData {
  data: Array<{
    date: string;
    ore_tons: number;
    waste_tons: number;
    grade_gpt: number;
    location: string;
  }>;
  summary: {
    total_ore: number;
    total_waste: number;
    avg_grade: number;
  };
}

export interface ExpensesData {
  data: Array<{
    date: string;
    category: string;
    amount: number;
    description: string;
  }>;
  summary: {
    total: number;
    by_category: Record<string, number>;
  };
}

export interface LaborData {
  data: Array<{
    date: string;
    workers_present: number;
    hours_worked: number;
    productivity_index: number;
    department: string;
  }>;
  summary: {
    total_workers: number;
    avg_hours: number;
    avg_productivity: number;
  };
}

export interface EnvironmentalData {
  data: Array<{
    date: string;
    dust_level: number;
    noise_level: number;
    water_ph: number;
    water_usage: number;
  }>;
  summary: {
    avg_dust: number;
    avg_noise: number;
    avg_ph: number;
    total_water: number;
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

export const fetchGoldProductionData = async (dateRange: DateRangeParams): Promise<GoldProductionResponse> => {
  const { data } = await api.get<GoldProductionResponse>(
    `/api/mining-operations/gold-production/?from_date=${dateRange.from_date}&to_date=${dateRange.to_date}`,
  );
  return data;
};

export const fetchDashboardData = async (params: DateRangeParams) => {
  const response = await api.get(`/api/mining-operations/dashboard-data/?from_date=${params.from_date}&to_date=${params.to_date}`);
  return response.data;
};

export const fetchDailyLogs = async (params: DateRangeParams) => {
  const response = await api.get(`/api/daily-logs/?from_date=${params.from_date}&to_date=${params.to_date}`);
  return response.data;
};

export const fetchMachineryStatus = async (params: DateRangeParams) => {
  const response = await api.get(`/api/machinery-status/?from_date=${params.from_date}&to_date=${params.to_date}`);
  return response.data;
};

export const fetchChemicalInventory = async (params: DateRangeParams) => {
  const response = await api.get(`/api/chemical-inventory/?from_date=${params.from_date}&to_date=${params.to_date}`);
  return response.data;
};

export const fetchSafetyIncidents = async (params: DateRangeParams) => {
  const response = await api.get(`/api/safety-incidents/?from_date=${params.from_date}&to_date=${params.to_date}`);
  return response.data;
};

export const fetchEnergyUsage = async (params: DateRangeParams) => {
  const response = await api.get(`/api/mining-operations/energy-usage/?from_date=${params.from_date}&to_date=${params.to_date}`);
  return response.data;
};

export const fetchProductionMetrics = async (params: DateRangeParams) => {
  const response = await api.get(`/api/production-metrics/?from_date=${params.from_date}&to_date=${params.to_date}`);
  return response.data;
};

export const fetchEquipmentStatus = async (params: DateRangeParams) => {
  const response = await api.get(`/api/equipment-status/?from_date=${params.from_date}&to_date=${params.to_date}`);
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
      `/api/mining-operations/gold-production/`,
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
  const response = await api.get(`/api/mining-operations/chemicals-usage/?from_date=${params.from_date}&to_date=${params.to_date}`);
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
    const response = await api.get('/api/stockpile-volumes/', { params });
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
      const response = await api.get<{ logs: DailyLog[], summary: any }>('/api/mining/daily-logs/');
      return response.data;
    } catch (error) {
      console.error('Error fetching daily logs:', error);
      throw error;
    }
  },

  // Get chemical inventory
  getChemicals: async () => {
    try {
      const response = await api.get<{ chemicals: ChemicalInventory[], summary: any }>('/api/dashboard/chemicals/');
      return response.data;
    } catch (error) {
      console.error('Error fetching chemical inventory:', error);
      throw error;
    }
  },

  // Get safety incidents and summary
  getSafetyIncidents: async () => {
    try {
      const response = await api.get<{ incidents: SafetyIncident[], summary: any }>('/api/dashboard/safety/');
      return response.data;
    } catch (error) {
      console.error('Error fetching safety incidents:', error);
      throw error;
    }
  },

  // Get explosives inventory
  getExplosives: async () => {
    try {
      const response = await api.get<{ explosives: ExplosiveInventory[], summary: any }>('/api/dashboard/explosives/');
      return response.data;
    } catch (error) {
      console.error('Error fetching explosives inventory:', error);
      throw error;
    }
  },

  // Get stockpile volumes
  getStockpile: async () => {
    try {
      const response = await api.get<{ data: DailyStockpileData[], summary: StockpileSummary }>('/api/dashboard/stockpile/');
      return response.data;
    } catch (error) {
      console.error('Error fetching stockpile volumes:', error);
      throw error;
    }
  },

  // Get daily expenses
  getExpenses: async () => {
    try {
      const response = await api.get<{ data: DailyExpense[], summary: any }>('/api/dashboard/expenses/');
      return response.data;
    } catch (error) {
      console.error('Error fetching daily expenses:', error);
      throw error;
    }
  },

  // Get labor metrics
  getLaborMetrics: async () => {
    try {
      const response = await api.get<{ data: LaborMetrics[], summary: any }>('/api/dashboard/labor/');
      return response.data;
    } catch (error) {
      console.error('Error fetching labor metrics:', error);
      throw error;
    }
  },

  // Get environmental metrics
  getEnvironmentalMetrics: async () => {
    try {
      const response = await api.get<{ data: EnvironmentalMetrics[], summary: any }>('/api/dashboard/environmental/');
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
      
      const response = await api.get('/api/energy-usage/', {
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
      
      const response = await api.get('/api/mining-operations/chemicals-usage/', {
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
  async fetchDashboardData(startDate: Date, endDate: Date): Promise<DashboardData> {
    try {
      const formattedStartDate = format(startDate, 'yyyy-MM-dd');
      const formattedEndDate = format(endDate, 'yyyy-MM-dd');
      
      const response = await api.get('/api/mining-operations/dashboard-data/', {
        params: {
          from_date: formattedStartDate,
          to_date: formattedEndDate,
        }
      });
      const data = response.data;
      
      // Initialize chemicals data if not present
      if (!data.chemicals) {
        data.chemicals = {
          data: [],
          summary: {
            total_cost: 0,
            most_used_chemical: '',
            avg_daily_cost: 0,
            cost_trend: 0
          }
        };
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      return {
        production: {
          data: [],
          summary: {
            avg_tonnage_crushed: 0,
            avg_tonnage_hoisted: 0,
            avg_recovery_rate: 0,
            avg_efficiency: 0,
            trend_tonnage_crushed: 0,
            trend_recovery_rate: 0,
          },
        },
        safety: {
          data: [],
          summary: {
            total_incidents: 0,
            days_without_incident: 0,
            severity_breakdown: {
              low: 0,
              medium: 0,
              high: 0,
              critical: 0,
            },
          },
        },
        explosives: {
          data: [],
          summary: { total_value: 0, latest_inventory: { anfo: 0, emulsion: 0 } }
        },
        stockpile: {
          data: [],
          summary: { total_ore: 0, total_waste: 0, avg_grade: 0 }
        },
        expenses: {
          data: [],
          summary: { total: 0, by_category: {} }
        },
        labor: {
          data: [],
          summary: { avg_productivity: 0, total_workers: 0, safety_incidents: 0 }
        },
        environmental: {
          data: [],
          summary: { avg_dust: 0, total_water: 0, rehabilitation_area: 0 }
        },
        energy: {
          data: [],
          summary: {
            avg_electricity_kwh: 0,
            avg_electricity_cost: 0,
            avg_diesel_liters: 0,
            avg_diesel_cost: 0,
            avg_total_cost: 0,
            trend_electricity: 0,
            trend_diesel: 0,
            trend_cost: 0,
          },
        },
        chemicals: {
          data: [],
          summary: {
            total_cost: 0,
            most_used_chemical: '',
            avg_daily_cost: 0,
            cost_trend: 0
          }
        }
      };
    }
  },

  getDashboardData: async (params: DateRangeParams): Promise<DashboardData> => {
    try {
      const response = await api.get('/api/mining-operations/dashboard-data/', {
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
      const response = await api.get('/api/dashboard/energy-usage/', {
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
      const response = await api.get('/api/mining-operations/chemicals-usage/', {
        params: params
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching chemicals usage data:', error);
      throw error;
    }
  },

  // Get safety incidents data
  getSafetyData: async (params: DateRangeParams): Promise<SafetyData> => {
    try {
      const response = await api.get('/api/safety-incidents/', {
        params: params
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching safety data:', error);
      throw error;
    }
  },
};

export default api;
