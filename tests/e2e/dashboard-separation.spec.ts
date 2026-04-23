import { expect, test } from '@playwright/test';
import { loginThroughUi, trackFrontendErrors } from './helpers/app';
import {
  createMockSupabaseState,
  createMonthBalanceRow,
  createProjectionTemplateRow,
  installMockSupabase,
} from './helpers/mockSupabase';

test('mantém contas projetadas apenas no planejamento e fora do financeiro real', async ({ page }) => {
  const state = createMockSupabaseState({
    projectionTemplates: [
      createProjectionTemplateRow({
        title: 'Aluguel',
        accountName: 'Aluguel',
        categoryName: 'Moradia',
        amount: 800,
      }),
    ],
    monthBalances: [createMonthBalanceRow(2, 2026, 0)],
  });

  await installMockSupabase(page, state);
  const frontend = trackFrontendErrors(page);

  await loginThroughUi(page);

  const projectionSlide = page.getByTestId('dashboard-slide-projection');
  const realSlide = page.getByTestId('dashboard-slide-real');

  await expect(projectionSlide).toContainText(/Contas projetadas do mes/i);
  await expect(projectionSlide).toContainText('R$ 800,00');

  await page.getByRole('button', { name: 'Ir para dashboard Real' }).click();
  await expect(realSlide.getByText('- R$ 0,00')).toBeVisible();

  await page.getByRole('button', { name: 'Ir para dashboard Planejamento' }).click();
  await expect(projectionSlide).toContainText(/Contas projetadas do mes/i);
  await expect(projectionSlide).toContainText('R$ 800,00');

  await frontend.expectClean();
});
