import { BarChart3, ShieldCheck, TrendingUp } from 'lucide-react';

const HIGHLIGHTS = [
  { icon: TrendingUp, text: 'Cotações diárias de commodities em um só lugar' },
  { icon: BarChart3, text: 'Fórmulas de precificação e formação de preços' },
  { icon: ShieldCheck, text: 'Acesso seguro com perfis de usuário' },
];

/** Painel institucional exibido ao lado do formulário de login (telas grandes). */
export function LoginHero() {
  return (
    <section
      aria-label="Sobre o sistema"
      className="hidden flex-col justify-center lg:flex"
    >
      <p className="text-accent-strong text-sm font-semibold tracking-widest uppercase">
        Plataforma comercial
      </p>
      <h2 className="text-foreground mt-3 max-w-md text-4xl leading-tight font-bold tracking-tight">
        Preços mais precisos, decisões mais rápidas.
      </h2>
      <p className="text-muted mt-4 max-w-md text-base">
        Centralize produtos, cotações e fórmulas para formar preços com base nos custos
        reais da operação.
      </p>

      <ul className="mt-8 flex flex-col gap-4">
        {HIGHLIGHTS.map(({ icon: Icon, text }) => (
          <li key={text} className="text-foreground flex items-center gap-3 text-sm">
            <span className="border-border bg-surface text-primary dark:text-accent flex size-9 items-center justify-center rounded-lg border shadow-sm">
              <Icon className="size-4.5" aria-hidden="true" />
            </span>
            {text}
          </li>
        ))}
      </ul>

      {/* Gráfico ilustrativo */}
      <div
        aria-hidden="true"
        className="border-border bg-surface/70 mt-10 max-w-md rounded-xl border p-5 shadow-sm backdrop-blur"
      >
        <div className="text-muted flex items-center justify-between text-xs">
          <span>Alumínio · USD/t</span>
          <span className="text-success-text font-semibold">+1,2%</span>
        </div>
        <svg viewBox="0 0 300 90" className="mt-3 h-24 w-full">
          <defs>
            <linearGradient id="login-hero-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#2563EB" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0 70 L40 62 L80 66 L120 48 L160 52 L200 34 L240 38 L300 16 L300 90 L0 90 Z"
            fill="url(#login-hero-fill)"
          />
          <path
            d="M0 70 L40 62 L80 66 L120 48 L160 52 L200 34 L240 38 L300 16"
            fill="none"
            stroke="#2563EB"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <circle cx="300" cy="16" r="4" fill="#06B6D4" />
        </svg>
      </div>
    </section>
  );
}
