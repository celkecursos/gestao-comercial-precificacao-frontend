import { Calculator, LineChart, Package, Users, type LucideIcon } from 'lucide-react';
import { ErrorState, LoadingState } from '@/components/feedback/states';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader } from '@/components/ui/Card';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/routes/paths';
import { dashboardService } from '@/services/dashboardService';
import { quotationService } from '@/services/quotationService';
import type { DashboardCardKey } from '@/types/dashboard';
import { QuotationChart } from './components/QuotationChart';
import { RecentQuotations } from './components/RecentQuotations';
import { StatCard } from './components/StatCard';

const CARD_CONFIG: Record<
  DashboardCardKey,
  { title: string; icon: LucideIcon; to: string; tone: 'primary' | 'accent' }
> = {
  users: { title: 'Usuários', icon: Users, to: ROUTES.users, tone: 'primary' },
  products: { title: 'Produtos', icon: Package, to: ROUTES.products, tone: 'accent' },
  quotations: {
    title: 'Cotações',
    icon: LineChart,
    to: ROUTES.quotations,
    tone: 'primary',
  },
  pricingFormulas: {
    title: 'Fórmulas',
    icon: Calculator,
    to: ROUTES.pricingFormulas,
    tone: 'accent',
  },
};

const CHART_QUOTATIONS_LIMIT = 100;

export function DashboardPage() {
  const { user, isAdmin } = useAuth();
  const summary = useApiQuery(() => dashboardService.getSummary(), 'dashboard');
  const quotations = useApiQuery(
    () => quotationService.list({ limit: CHART_QUOTATIONS_LIMIT }),
    'dashboard-quotations',
  );

  const firstName = user?.name.split(' ')[0];

  return (
    <>
      <PageHeader
        title="Dashboard"
        description={`Olá${firstName ? `, ${firstName}` : ''}! Acompanhe os principais indicadores...`}
      />

      <section aria-label="Indicadores" className="mb-6">
        {summary.loading && !summary.data ? (
          <Card>
            <LoadingState message="Carregando indicadores..." />
          </Card>
        ) : summary.error ? (
          <Card>
            <ErrorState message={summary.error} onRetry={summary.reload} />
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {summary.data?.cards.map((card) => {
              const config = CARD_CONFIG[card.key];
              return (
                <StatCard
                  key={card.key}
                  title={config.title}
                  value={card.value}
                  icon={config.icon}
                  to={card.key === 'users' && !isAdmin ? undefined : config.to}
                  tone={config.tone}
                />
              );
            })}
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader
            title="Evolução das cotações"
            description="Valores cadastrados por data para cada commodity."
          />
          {quotations.loading && !quotations.data ? (
            <LoadingState message="Carregando cotações..." />
          ) : quotations.error ? (
            <ErrorState message={quotations.error} onRetry={quotations.reload} />
          ) : (
            <QuotationChart quotations={quotations.data?.data ?? []} />
          )}
        </Card>

        <Card>
          <CardHeader title="Últimas cotações" />
          {quotations.loading && !quotations.data ? (
            <LoadingState />
          ) : quotations.error ? (
            <ErrorState message={quotations.error} />
          ) : (
            <RecentQuotations quotations={(quotations.data?.data ?? []).slice(0, 6)} />
          )}
        </Card>
      </div>
    </>
  );
}
