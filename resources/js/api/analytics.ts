import api from './client';

export interface AnalyticsFunnel {
    days: number;
    searchCount: number;
    serviceViewCount: number;
    bookingStartedCount: number;
    bookingConfirmedCount: number;
    searchToViewRate: number;
    viewToStartRate: number;
    startToConfirmRate: number;
}

export const analyticsApi = {
    funnel: (days = 30) =>
        api
            .get<AnalyticsFunnel>('/analytics/funnel', {
                params: { days },
            })
            .then((response) => response.data),
};
