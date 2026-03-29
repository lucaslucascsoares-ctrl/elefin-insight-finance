import { expect, test } from '@playwright/test';
import { loginThroughUi, openMonthProjectionSection, trackFrontendErrors } from './helpers/app';
import {
  createMockSupabaseState,
  createMonthBalanceRow,
  createProjectionTemplateRow,
  installMockSupabase,
} from './helpers/mockSupabase';

test('edita o valor só no mês sem alterar o padrão global da projeção', async ({ page }) => {
  const state = createMockSupabaseState();
  const rentCategory = state.categories.find((category) => category.name === 'Aluguel');
  const rentTemplate = createProjectionTemplateRow({
    title: 'Aluguel',
    accountName: 'Aluguel',
    categoryName: 'Moradia',
    amount: 800,
    categoryId: rentCategory?.id ?? null,
  });

  state.projectionTemplates = [rentTemplate];
  state.monthBalances = [createMonthBalanceRow(2, 2026, 0), createMonthBalanceRow(3, 2026, 0)];

  await installMockSupabase(page, state);
  const frontend = trackFrontendErrors(page);

  await loginThroughUi(page);
  await openMonthProjectionSection(page);

  await page.getByTestId(`projected-item-${rentTemplate.id}`).click();
  await page.getByTestId('edit-month-action').click();
  await page.locator('#month-item-amount').fill('920');
  await page.getByTestId('save-month-edit-action').click();

  await expect(page.locator('#projection-section')).toContainText('R$ 920,00');
  await page.getByRole('button', { name: 'Fechar' }).click();

  await page.getByRole('button', { name: 'Avançar um mês' }).click();
  await expect(page.getByText(/abril de 2026/i)).toBeVisible();
  await openMonthProjectionSection(page);
  await expect(page.locator('#projection-section')).toContainText('R$ 800,00');

  await page.getByRole('button', { name: 'Voltar um mês' }).click();
  await expect(page.getByText(/março de 2026/i)).toBeVisible();
  await openMonthProjectionSection(page);
  await expect(page.locator('#projection-section')).toContainText('R$ 920,00');

  await frontend.expectClean();
});
