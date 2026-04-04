export type PricingRuleType = 'SEASONAL' | 'WEEKEND' | 'DURATION';
export type PricingAdjustmentType = 'PERCENTAGE' | 'FIXED_AMOUNT';

export interface ServicePricingRule {
    id: string;
    serviceId: string;
    name: string;
    ruleType: PricingRuleType;
    adjustmentType: PricingAdjustmentType;
    adjustmentValue: number;
    startDate?: Date;
    endDate?: Date;
    minUnits?: number;
    priority: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface ServicePricingRulePayload {
    name: string;
    rule_type: PricingRuleType;
    adjustment_type: PricingAdjustmentType;
    adjustment_value: number;
    start_date?: string | null;
    end_date?: string | null;
    min_units?: number | null;
    priority?: number;
    is_active?: boolean;
}
