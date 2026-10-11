import { useTheme } from './useTheme';

/** Cores dos gráficos (Recharts) para cada tema, garantindo legibilidade nos dois. */
const CHART_THEMES = {
  light: {
    line: '#2563EB',
    fill: '#2563EB',
    highlight: '#0891B2',
    grid: '#E2E8F0',
    axis: '#64748B',
    tooltipBackground: '#FFFFFF',
    tooltipBorder: '#E2E8F0',
    tooltipText: '#0F172A',
  },
  dark: {
    line: '#60A5FA',
    fill: '#2563EB',
    highlight: '#06B6D4',
    grid: '#22224F',
    axis: '#94A3B8',
    tooltipBackground: '#0B0B2A',
    tooltipBorder: '#2E2E66',
    tooltipText: '#F8FAFC',
  },
} as const;

export type ChartTheme = (typeof CHART_THEMES)[keyof typeof CHART_THEMES];

export function useChartTheme(): ChartTheme {
  const { theme } = useTheme();
  return CHART_THEMES[theme];
}
