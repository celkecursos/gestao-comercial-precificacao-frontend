/** Caminhos das rotas da aplicação. Use sempre estas constantes em links e redirecionamentos. */
export const ROUTES = {
  login: '/login',
  forgotPassword: '/esqueci-senha',
  /** Recebe `?token=` do link enviado por e-mail (PASSWORD_RESET_URL no backend). */
  resetPassword: '/redefinir-senha',
  dashboard: '/dashboard',
  users: '/usuarios',
  products: '/produtos',
  quotations: '/cotacoes',
  pricingFormulas: '/formulas',
  profile: '/perfil',
} as const;
