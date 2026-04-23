import { expect, test } from '@playwright/test';
import { loginThroughUi, openMonthProjectionSection, trackFrontendErrors } from './helpers/app';
import {
  createMockSupabaseState,
  createMonthBalanceRow,
  createProjectionTemplateRow,
  installMockSupabase,
} from './helpers/mockSupabase';

test('marca uma conta projetada como paga e reflete isso apenas no dashboard real', async ({ page }) => {
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
  state.monthBalances = [createMonthBalanceRow(2, 2026, 0)];

  await installMockSupabase(page, state);
  const frontend = trackFrontendErrors(page);

  await loginThroughUi(page);
  await openMonthProjectionSection(page);

  await page.getByTestId(`projected-item-${rentTemplate.id}`).click();
  await page.getByTestId('mark-paid-action').click();

  await expect(page.getByTestId('mark-paid-action')).toBeHidden();
  await page.getByRole('button', { name: 'Ir para dashboard Real' }).click();
  await expect(page.getByTestId('dashboard-slide-real').getByText('- R$ 800,00')).toBeVisible();

  await page.reload();
  await page.getByRole('button', { name: 'Ir para dashboard Real' }).click();
  await expect(page.getByTestId('dashboard-slide-real').getByText('- R$ 800,00')).toBeVisible();

  await frontend.expectClean();
});
