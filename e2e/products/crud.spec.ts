import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import {
  PRODUCTS_LIST,
  deleteProductsBySearch,
  searchProducts,
} from './products.helpers.ts';

/**
 * E2E do módulo Produtos — ciclo completo pela tela, como administrador.
 *
 * O que ele cobre, e que nenhuma outra camada alcança: o contrato real da API
 * (POST/PATCH/PATCH status/DELETE em /products), o erro de negócio do backend chegando
 * ao usuário (código duplicado → 409), o filtro de status enviado à API e a listagem
 * refletindo cada mudança.
 *
 * O que ele NÃO cobre: as regras puras do formulário (padrão do código, tamanho mínimo do
 * nome) — só confere que o formulário vazio bloqueia o envio. A regra de perfil (quem
 * pode excluir) fica no `access.spec.ts`.
 *
 * Dado de teste: um produto `E2E Produto <carimbo>` / código `E2E-<carimbo>` criado e
 * EXCLUÍDO pelo próprio teste (a exclusão é física). Se um passo falhar no meio, o
 * `afterAll` remove pela API.
 */

const STAMP = Date.now().toString().slice(-8);
const NAME = `E2E Produto ${STAMP}`;
const EDITED_NAME = `${NAME} Editado`;
const CODE = `E2E-${STAMP}`;
const UNIT = 'KG';

/** A linha da tabela deste teste, achada pelo código (não muda ao editar o nome). */
function rowOf(page: Page) {
  return page.getByRole('row').filter({ hasText: CODE });
}

/** Toast de sucesso (`role="status"`) com a mensagem exata da ação. */
function successToast(page: Page, message: string) {
  return page.getByRole('status').filter({ hasText: message });
}

/** Troca o filtro de status e espera a listagem chegar com o parâmetro `active` certo. */
async function filterByStatus(page: Page, label: string, active: string) {
  const response = page.waitForResponse(
    (r) =>
      r.request().method() === 'GET' &&
      new URL(r.url()).pathname.endsWith('/products') &&
      new URL(r.url()).searchParams.get('search') === CODE &&
      new URL(r.url()).searchParams.get('active') === active,
  );
  await page.getByLabel('Status').selectOption({ label });
  expect((await response).ok()).toBe(true);
}

test.describe('Produtos', () => {
  test.afterAll(async () => {
    // Rede de segurança: só age se o teste parou antes do passo de exclusão.
    await deleteProductsBySearch(CODE);
  });

  test('cadastro, edição, desativação e exclusão', async ({ page }) => {
    await test.step('abre a listagem', async () => {
      await page.goto(PRODUCTS_LIST);
      await expect(
        page.getByRole('heading', { name: 'Produtos', level: 1 }),
      ).toBeVisible();
    });

    await test.step('formulário vazio não chega na API', async () => {
      let posts = 0;
      page.on('request', (r) => {
        if (r.method() === 'POST' && r.url().endsWith('/products')) posts++;
      });

      await page.getByRole('button', { name: 'Novo produto' }).click();
      const dialog = page.getByRole('dialog', { name: 'Novo produto' });
      await dialog.getByRole('button', { name: 'Salvar' }).click();

      await expect(dialog.getByText('Informe o código.')).toBeVisible();
      await expect(dialog.getByText('Informe a unidade.')).toBeVisible();
      await expect(dialog.getByText('Informe o nome.')).toBeVisible();
      expect(posts).toBe(0);

      await dialog.getByRole('button', { name: 'Cancelar' }).click();
      await expect(dialog).toBeHidden();
    });

    await test.step('cadastra um produto', async () => {
      await page.getByRole('button', { name: 'Novo produto' }).click();
      const dialog = page.getByRole('dialog', { name: 'Novo produto' });
      // O campo converte para maiúsculas: digita em minúsculas para provar isso.
      await dialog.getByLabel('Código').fill(CODE.toLowerCase());
      await expect(dialog.getByLabel('Código')).toHaveValue(CODE);
      await dialog.getByLabel('Unidade').fill(UNIT);
      await dialog.getByLabel('Nome').fill(NAME);
      await dialog.getByLabel('Descrição').fill('Criado pelo teste e2e.');

      const response = page.waitForResponse(
        (r) => r.request().method() === 'POST' && r.url().endsWith('/products'),
      );
      await dialog.getByRole('button', { name: 'Salvar' }).click();
      expect((await response).status()).toBe(201);

      await expect(dialog).toBeHidden();
      await expect(successToast(page, 'Produto cadastrado com sucesso.')).toBeVisible();
    });

    await test.step('encontra o produto pela busca', async () => {
      await searchProducts(page, CODE);
      const row = rowOf(page);
      await expect(row).toBeVisible();
      await expect(row).toContainText(NAME);
      await expect(row).toContainText(UNIT);
      await expect(row).toContainText('Ativo');
    });

    await test.step('código duplicado — o erro da API aparece no modal', async () => {
      await page.getByRole('button', { name: 'Novo produto' }).click();
      const dialog = page.getByRole('dialog', { name: 'Novo produto' });
      await dialog.getByLabel('Código').fill(CODE); // o MESMO código de cima
      await dialog.getByLabel('Unidade').fill(UNIT);
      await dialog.getByLabel('Nome').fill(`${NAME} Duplicado`);

      const response = page.waitForResponse(
        (r) => r.request().method() === 'POST' && r.url().endsWith('/products'),
      );
      await dialog.getByRole('button', { name: 'Salvar' }).click();
      expect((await response).status()).toBe(409);

      // O modal FICA aberto, com a mensagem do backend, para o usuário corrigir.
      await expect(dialog.getByRole('alert')).toHaveText(
        'Já existe um produto com este código.',
      );
      await dialog.getByRole('button', { name: 'Cancelar' }).click();
      await expect(dialog).toBeHidden();
    });

    await test.step('edita o nome', async () => {
      await rowOf(page)
        .getByRole('button', { name: `Editar ${NAME}`, exact: true })
        .click();
      const dialog = page.getByRole('dialog', { name: 'Editar produto' });
      await expect(dialog.getByLabel('Código')).toHaveValue(CODE);
      await dialog.getByLabel('Nome').fill(EDITED_NAME);

      const response = page.waitForResponse(
        (r) => r.request().method() === 'PATCH' && /\/products\/\d+$/.test(r.url()),
      );
      await dialog.getByRole('button', { name: 'Salvar' }).click();
      expect((await response).ok()).toBe(true);

      await expect(dialog).toBeHidden();
      await expect(successToast(page, 'Produto atualizado com sucesso.')).toBeVisible();
      await expect(rowOf(page)).toContainText(EDITED_NAME);
    });

    await test.step('desativa', async () => {
      const response = page.waitForResponse(
        (r) =>
          r.request().method() === 'PATCH' && /\/products\/\d+\/status$/.test(r.url()),
      );
      await rowOf(page)
        .getByRole('button', { name: `Desativar ${EDITED_NAME}`, exact: true })
        .click();
      expect((await response).ok()).toBe(true);

      await expect(successToast(page, 'Produto desativado.')).toBeVisible();
      await expect(rowOf(page)).toContainText('Inativo');
      await expect(
        rowOf(page).getByRole('button', { name: `Ativar ${EDITED_NAME}`, exact: true }),
      ).toBeVisible();
    });

    await test.step('filtro de status respeita o produto inativo', async () => {
      await filterByStatus(page, 'Ativos', 'true');
      await expect(page.getByText('Nenhum produto encontrado')).toBeVisible();
      await expect(rowOf(page)).toHaveCount(0);

      await filterByStatus(page, 'Inativos', 'false');
      await expect(rowOf(page)).toBeVisible();
    });

    await test.step('exclui', async () => {
      await rowOf(page)
        .getByRole('button', { name: `Excluir ${EDITED_NAME}`, exact: true })
        .click();
      const dialog = page.getByRole('dialog', { name: 'Excluir produto' });
      await expect(dialog).toContainText(EDITED_NAME);

      const response = page.waitForResponse(
        (r) => r.request().method() === 'DELETE' && /\/products\/\d+$/.test(r.url()),
      );
      await dialog.getByRole('button', { name: 'Excluir', exact: true }).click();
      expect((await response).ok()).toBe(true);

      await expect(successToast(page, 'Produto excluído.')).toBeVisible();
      await expect(rowOf(page)).toBeHidden();
    });
  });
});
