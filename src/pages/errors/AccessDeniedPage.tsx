import { ShieldAlert } from 'lucide-react';
import { Link } from 'react-router';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { ROUTES } from '@/routes/paths';

export function AccessDeniedPage() {
  return (
    <>
      <PageHeader title="Acesso restrito" />
      <Card className="flex flex-col items-center gap-3 px-6 py-14 text-center">
        <span className="bg-warning-soft text-warning-text flex size-12 items-center justify-center rounded-full">
          <ShieldAlert className="size-6" aria-hidden="true" />
        </span>
        <p className="text-foreground font-medium">
          Você não tem permissão para acessar esta página.
        </p>
        <p className="text-muted text-sm">
          Fale com um administrador caso precise de acesso.
        </p>
        <Link
          to={ROUTES.dashboard}
          className="text-primary-text mt-2 text-sm font-medium hover:underline"
        >
          Voltar ao dashboard
        </Link>
      </Card>
    </>
  );
}
