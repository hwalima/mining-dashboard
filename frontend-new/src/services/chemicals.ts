import api from './api';

export interface ChemicalUsageRecord {
  id: number;
  date: string;
  chemical: {
    id: number;
    name: string;
  };
  amount_used: number;
  process: string;
  notes: string | null;
}

export interface Chemical {
  id: number;
  name: string;
  unit: string;
  current_stock: number;
  minimum_required: number;
  unit_price: number;
}

export interface CreateChemicalUsageRecord {
  date: string;
  chemical_id: number;
  amount_used: number;
  process: string;
  notes: string | null;
}

export interface UpdateChemicalUsageRecord extends CreateChemicalUsageRecord {
  id: number;
}

class ChemicalsService {
  async getChemicals(): Promise<Chemical[]> {
    const response = await api.get('/chemicals/');
    return response.data;
  }

  async getChemicalUsageRecords(startDate?: Date, endDate?: Date): Promise<ChemicalUsageRecord[]> {
    const params = new URLSearchParams();
    if (startDate) {
      params.append('start_date', startDate.toISOString().split('T')[0]);
    }
    if (endDate) {
      params.append('end_date', endDate.toISOString().split('T')[0]);
    }
    const queryString = params.toString();
    const response = await api.get(`/chemical-usage/${queryString ? `?${queryString}` : ''}`);
    return response.data;
  }

  async createChemicalUsageRecord(data: CreateChemicalUsageRecord): Promise<ChemicalUsageRecord> {
    const response = await api.post('/chemical-usage/', data);
    return response.data;
  }

  async updateChemicalUsageRecord(data: UpdateChemicalUsageRecord): Promise<ChemicalUsageRecord> {
    const response = await api.put(`/chemical-usage/${data.id}/`, data);
    return response.data;
  }

  async deleteChemicalUsageRecord(id: number): Promise<void> {
    await api.delete(`/chemical-usage/${id}/`);
  }
}

export const chemicalsService = new ChemicalsService();
