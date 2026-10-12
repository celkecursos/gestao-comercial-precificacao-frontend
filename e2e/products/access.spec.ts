import { expect, test } from '@playwright/test';
import { adminApi } from '../support/api.ts';
import { USER_SESSION } from '../support/sessions.ts';
import { deleteProductsBySearch, searchProducts } from './products.helpers.ts';

/**
 * E2E do módulo Produtos — quem pode o quê.
 *
 * Cobre o que o perfil Usuário (não admin) tem na tela: vê o menu e a listagem, pode
 * cadastrar, editar e ativar/desativar, mas NÃO tem a ação de excluir (só o admin, como
 * no `@Roles(Admin)` do DELETE da API). O ciclo completo como admin está no `crud.spec.ts`.
 *
 * Dado de teste: um produto `E2E Acesso <carimbo>` / código `E2E-AC-<carimbo>` criado
 * pela API no `beforeAll` (o alvo da asserção, não o que se testa) e excluído no `afterAll`.
 */

const STAMP = Date.now().toString().slice(-8);
const NAME = `E2E Acesso ${STAMP}`;
const CODE = `E2E-AC-${STAMP}`;

test.describe('perfil Usuário (não admin)', () => {
  test.use({ storageState: USER_SESSION });

  test.beforeAll(async () => {
    const api = await adminApi();
    const response = await api.post('/products', {
      data: { code: CODE, name: NAME, unit: 'UN' },
    });
    expect(response.status()).toBe(201);
    await api.dispose();
  });

  test.afterAll(async () => {
    await deleteProductsBySearch(CODE);
  });

  test('vê e altera produtos, mas não exclui', async ({ page }) => {
    await page.goto('/dashboard');
    const menu = page.getByRole('navigation', { name: 'Menu principal' });
    await expect(menu.getByRole('link', { name: 'Produtos' })).toBeVisible();

    await searchProducts(page, CODE);
    await expect(page.getByRole('heading', { name: 'Produtos', level: 1 })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Novo produto' })).toBeVisible();

    const row = page.getByRole('row').filter({ hasText: CODE });
    // Âncora: as ações da linha renderizaram — sem ela, "não tem Excluir" passaria vazio.
    await expect(
      row.getByRole('button', { name: `Editar ${NAME}`, exact: true }),
    ).toBeVisible();
    await expect(
      row.getByRole('button', { name: `Desativar ${NAME}`, exact: true }),
    ).toBeVisible();
    await expect(
      row.getByRole('button', { name: `Excluir ${NAME}`, exact: true }),
    ).toHaveCount(0);
  });
});
