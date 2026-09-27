import { Mail, ShieldCheck, CalendarDays } from 'lucide-react';
import { LoadingState } from '@/components/feedback/states';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/hooks/useAuth';
import { ROLE_LABELS, Role } from '@/types/user';
import { formatDateTime } from '@/utils/format';
import { ChangePasswordCard } from './ChangePasswordCard';
import { ProfileDetailsCard } from './ProfileDetailsCard';

export function ProfilePage() {
  const { user } = useAuth();
  if (!user) return <LoadingState />;

  return (
    <>
      <PageHeader title="Meu Perfil" description="Seus dados de acesso ao sistema." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="h-fit p-6">
          <div className="flex flex-col items-center text-center">
            <span
              aria-hidden="true"
              className="bg-primary text-primary-foreground ring-accent/30 flex size-20 items-center justify-center rounded-full text-2xl font-semibold ring-4"
            >
              {user.name.charAt(0).toUpperCase()}
            </span>
            <h2 className="text-foreground mt-4 text-lg font-semibold">{user.name}</h2>
            <div className="mt-2 flex gap-2">
              <Badge tone={user.role === Role.Admin ? 'accent' : 'primary'}>
                {ROLE_LABELS[user.role]}
              </Badge>
              <StatusBadge active={user.active} />
            </div>
          </div>
          <dl className="border-border mt-6 flex flex-col gap-3 border-t pt-5 text-sm">
            <div className="flex items-center gap-3">
              <Mail className="text-muted size-4 shrink-0" aria-hidden="true" />
              <dt className="sr-only">E-mail</dt>
              <dd className="text-foreground truncate">{user.email}</dd>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-muted size-4 shrink-0" aria-hidden="true" />
              <dt className="sr-only">Perfil</dt>
              <dd className="text-foreground">{ROLE_LABELS[user.role]}</dd>
            </div>
            <div className="flex items-center gap-3">
              <CalendarDays className="text-muted size-4 shrink-0" aria-hidden="true" />
              <dt className="text-muted">Membro desde</dt>
              <dd className="text-foreground">{formatDateTime(user.createdAt)}</dd>
            </div>
          </dl>
        </Card>

        <div className="flex flex-col gap-6 lg:col-span-2">
          <ProfileDetailsCard key={`${user.name}|${user.email}`} user={user} />
          <ChangePasswordCard />
        </div>
      </div>
    </>
  );
}
