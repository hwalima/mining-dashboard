export interface GoldProductionData {
    date: string;
    total_tonnage_crushed: number;
    total_tonnage_hoisted: number;
    total_tonnage_milled: number;
    gold_recovery_rate: number;
    operational_efficiency: number;
    smelted_gold: number;
    gold_price: number;
    gross_profit: number;
    notes?: string;
}

export interface GoldProductionSummary {
    total_smelted_gold: number;
    avg_recovery_rate: number;
    avg_efficiency: number;
    total_tonnage_crushed: number;
    total_tonnage_hoisted: number;
    total_gross_profit: number;
    avg_gold_price: number;
}

export interface GoldProductionResponse {
    data: GoldProductionData[];
    summary: GoldProductionSummary;
}
