import type { Page } from '@playwright/test';
import { adminApi } from '../support/api.ts';

export const PRODUCTS_LIST = '/produtos';

/** Abre a listagem e busca pelo termo, esperando a resposta filtrada (a busca tem debounce). */
export async function searchProducts(page: Page, term: string) {
  await page.goto(PRODUCTS_LIST);
  const filtered = page.waitForResponse(
    (r) =>
      r.request().method() === 'GET' &&
      new URL(r.url()).pathname.endsWith('/products') &&
      new URL(r.url()).searchParams.get('search') === term,
  );
  await page.getByLabel('Buscar produtos por nome ou código').fill(term);
  await filtered;
}

/** Limpeza do `afterAll`: exclui pela API os produtos que casam com a busca. */
export async function deleteProductsBySearch(term: string) {
  const api = await adminApi();
  const response = await api.get('/products', { params: { search: term } });
  const { data } = (await response.json()) as { data: { id: number }[] };
  for (const product of data) await api.delete(`/products/${product.id}`);
  await api.dispose();
}
