export interface Chemical {
  id: number;
  name: string;
  unit: string;
  current_stock: number;
  minimum_required: number;
  unit_price: number;
  created_at: string;
  updated_at: string;
}

export interface ChemicalFormData {
  name: string;
  unit: string;
  current_stock: number;
  minimum_required: number;
  unit_price: number;
}
