export type DashboardCardKey = 'users' | 'products' | 'quotations' | 'pricingFormulas';

export interface DashboardCard {
  key: DashboardCardKey;
  title: string;
  value: number;
}

export interface DashboardSummary {
  cards: DashboardCard[];
  generatedAt: string;
}
