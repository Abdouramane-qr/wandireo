import api from './client';
import type {
    ServicePricingRule,
    ServicePricingRulePayload,
} from '@/types/pricing-rule';

function normalizePricingRule(raw: Record<string, unknown>): ServicePricingRule {
    return {
        id: String(raw.id ?? ''),
        serviceId: String(raw.service_id ?? raw.serviceId ?? ''),
        name: String(raw.name ?? ''),
        ruleType: String(raw.rule_type ?? raw.ruleType ?? 'WEEKEND') as ServicePricingRule['ruleType'],
        adjustmentType: String(
            raw.adjustment_type ?? raw.adjustmentType ?? 'PERCENTAGE',
        ) as ServicePricingRule['adjustmentType'],
        adjustmentValue: Number(raw.adjustment_value ?? raw.adjustmentValue ?? 0),
        startDate:
            raw.start_date || raw.startDate
                ? new Date(String(raw.start_date ?? raw.startDate))
                : undefined,
        endDate:
            raw.end_date || raw.endDate
                ? new Date(String(raw.end_date ?? raw.endDate))
                : undefined,
        minUnits:
            raw.min_units == null && raw.minUnits == null
                ? undefined
                : Number(raw.min_units ?? raw.minUnits),
        priority: Number(raw.priority ?? 100),
        isActive: Boolean(raw.is_active ?? raw.isActive ?? true),
        createdAt: new Date(String(raw.created_at ?? raw.createdAt ?? new Date().toISOString())),
        updatedAt: new Date(String(raw.updated_at ?? raw.updatedAt ?? new Date().toISOString())),
    };
}

export const servicePricingApi = {
    list: (serviceId: string) =>
        api
            .get<unknown[]>(`/services/${serviceId}/pricing-rules`)
            .then((response) =>
                response.data.map((item) =>
                    normalizePricingRule(item as Record<string, unknown>),
                ),
            ),

    create: (serviceId: string, payload: ServicePricingRulePayload) =>
        api
            .post<unknown>(`/services/${serviceId}/pricing-rules`, payload)
            .then((response) =>
                normalizePricingRule(response.data as Record<string, unknown>),
            ),

    update: (
        serviceId: string,
        ruleId: string,
        payload: Partial<ServicePricingRulePayload>,
    ) =>
        api
            .patch<unknown>(
                `/services/${serviceId}/pricing-rules/${ruleId}`,
                payload,
            )
            .then((response) =>
                normalizePricingRule(response.data as Record<string, unknown>),
            ),

    remove: (serviceId: string, ruleId: string) =>
        api
            .delete(`/services/${serviceId}/pricing-rules/${ruleId}`)
            .then((response) => response.data),
};
