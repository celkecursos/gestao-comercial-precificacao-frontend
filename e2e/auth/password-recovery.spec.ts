import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

/**
 * E2E da recuperação de senha — telas "Esqueci minha senha" e "Redefinir senha".
 *
 * Cobre: o link a partir do login (levando o e-mail digitado), o pedido chegando à API
 * (`POST /auth/forgot-password` → 204) com a mensagem de sucesso única, o token inválido
 * voltando da API (`POST /auth/reset-password` → 400) com o caminho para pedir outro, o
 * link sem token, e o acesso às rotas com e sem sessão.
 *
 * NÃO cobre: a redefinição com um token válido — o token só existe no e-mail, que o
 * navegador não alcança; o fluxo completo é coberto pelo e2e do backend
 * (`test/auth/password-reset.e2e-spec.ts`). A regex da senha forte é regra pura: aqui só
 * se confere que o formulário bloqueia o envio.
 *
 * Dado de teste: nenhum. O pedido usa `e2e-<carimbo>@e2e.test`, que não existe — a API
 * responde igual (e não envia e-mail). Um pedido por execução: fica longe do limite da API
 * (10 por IP e 3 por e-mail a cada 15 minutos).
 */

const STAMP = Date.now().toString().slice(-8);
const UNKNOWN_EMAIL = `e2e-${STAMP}@e2e.test`;
const STRONG_PASSWORD = 'E2e@Senha123';

const isPost =
  (path: string) => (r: { url(): string; request(): { method(): string } }) =>
    r.request().method() === 'POST' && new URL(r.url()).pathname.endsWith(path);

/** Campos de senha: o rótulo "Nova senha" também é substring de "Confirmar nova senha". */
const newPasswordField = (page: Page) => page.getByLabel(/^Nova senha/);
const confirmPasswordField = (page: Page) => page.getByLabel(/^Confirmar nova senha/);

test.describe('sem sessão', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('pede o link a partir do login e vê sempre a mesma mensagem', async ({ page }) => {
    await test.step('o link do login leva o e-mail digitado', async () => {
      await page.goto('/login');
      await page.getByRole('textbox', { name: 'E-mail' }).fill(UNKNOWN_EMAIL);
      await page.getByRole('link', { name: 'Esqueci minha senha' }).click();

      await expect(page).toHaveURL(/\/esqueci-senha$/);
      await expect(
        page.getByRole('heading', { name: 'Esqueceu sua senha?', level: 1 }),
      ).toBeVisible();
      await expect(page.getByRole('textbox', { name: 'E-mail' })).toHaveValue(
        UNKNOWN_EMAIL,
      );
    });

    await test.step('e-mail vazio é bloqueado na tela (sem POST)', async () => {
      let posts = 0;
      page.on('request', (r) => {
        if (r.method() === 'POST' && r.url().endsWith('/auth/forgot-password')) posts++;
      });
      await page.getByRole('textbox', { name: 'E-mail' }).fill('');
      await page.getByRole('button', { name: 'Enviar link' }).click();
      await expect(page.getByText('Informe seu e-mail.')).toBeVisible();
      expect(posts).toBe(0);
    });

    await test.step('envia e mostra a mensagem única de sucesso', async () => {
      await page.getByRole('textbox', { name: 'E-mail' }).fill(UNKNOWN_EMAIL);
      const response = page.waitForResponse(isPost('/auth/forgot-password'));
      await page.getByRole('button', { name: 'Enviar link' }).click();
      expect((await response).status()).toBe(204);

      await expect(
        page.getByRole('heading', { name: 'Verifique seu e-mail', level: 1 }),
      ).toBeVisible();
      await expect(page.getByRole('status')).toContainText(
        'Se houver uma conta ativa com o e-mail informado',
      );
    });

    await test.step('volta para o login', async () => {
      await page.getByRole('link', { name: 'Voltar para o login' }).click();
      await expect(page).toHaveURL(/\/login$/);
    });
  });

  test('link sem token mostra o erro e o caminho para pedir outro', async ({ page }) => {
    await page.goto('/redefinir-senha');
    await expect(
      page.getByRole('heading', { name: 'Link inválido', level: 1 }),
    ).toBeVisible();
    await expect(page.getByRole('alert')).toContainText('inválido ou expirou');

    await page.getByRole('link', { name: 'Solicitar um novo link' }).click();
    await expect(page).toHaveURL(/\/esqueci-senha$/);
  });

  test('token recusado pela API mostra o erro e o caminho para pedir outro', async ({
    page,
  }) => {
    await page.goto(`/redefinir-senha?token=e2e-invalido-${STAMP}`);
    await expect(
      page.getByRole('heading', { name: 'Crie uma nova senha', level: 1 }),
    ).toBeVisible();

    await test.step('senha fraca e confirmação diferente são bloqueadas (sem POST)', async () => {
      let posts = 0;
      page.on('request', (r) => {
        if (r.method() === 'POST' && r.url().endsWith('/auth/reset-password')) posts++;
      });
      await newPasswordField(page).fill('fraca');
      await confirmPasswordField(page).fill('outra');
      await page.getByRole('button', { name: 'Redefinir senha' }).click();
      await expect(page.getByText(/^Mínimo de 8 caracteres/)).toBeVisible();
      await expect(
        page.getByText('A confirmação não confere com a nova senha.'),
      ).toBeVisible();
      expect(posts).toBe(0);
    });

    await test.step('a API recusa o token (400) e a tela oferece um novo link', async () => {
      await newPasswordField(page).fill(STRONG_PASSWORD);
      await confirmPasswordField(page).fill(STRONG_PASSWORD);
      const response = page.waitForResponse(isPost('/auth/reset-password'));
      await page.getByRole('button', { name: 'Redefinir senha' }).click();
      expect((await response).status()).toBe(400);

      await expect(
        page.getByRole('heading', { name: 'Link inválido', level: 1 }),
      ).toBeVisible();
      await expect(page.getByRole('alert')).toContainText(
        'Link de redefinição inválido ou expirado',
      );
      await expect(
        page.getByRole('link', { name: 'Solicitar um novo link' }),
      ).toBeVisible();
    });
  });
});

test.describe('com sessão (Administrador)', () => {
  test('/redefinir-senha abre mesmo logado; /esqueci-senha vai para o painel', async ({
    page,
  }) => {
    // O link do e-mail precisa funcionar num navegador que já tem sessão aberta.
    await page.goto(`/redefinir-senha?token=e2e-${STAMP}`);
    await expect(
      page.getByRole('heading', { name: 'Crie uma nova senha', level: 1 }),
    ).toBeVisible();

    await page.goto('/esqueci-senha');
    await expect(page).toHaveURL(/\/dashboard$/);
  });
});
