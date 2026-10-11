import type { DashboardSummary } from '@/types/dashboard';
import { api } from './api';

export const dashboardService = {
  async getSummary(): Promise<DashboardSummary> {
    const { data } = await api.get<DashboardSummary>('/dashboard');
    return data;
  },
};
