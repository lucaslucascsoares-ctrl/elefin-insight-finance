import { expect, test } from '@playwright/test';
import { loginThroughUi, trackFrontendErrors } from './helpers/app';
import {
  createMockSupabaseState,
  createMonthBalanceRow,
  createTransactionRow,
  installMockSupabase,
} from './helpers/mockSupabase';

test('navega entre março e abril sem misturar dados entre os meses', async ({ page }) => {
  const state = createMockSupabaseState({
    transactions: [createTransactionRow({ type: 'expense', amount: 1000, date: '2026-03-10' })],
    monthBalances: [createMonthBalanceRow(2, 2026, 0), createMonthBalanceRow(3, 2026, 0)],
  });

  await installMockSupabase(page, state);
  const frontend = trackFrontendErrors(page);

  await loginThroughUi(page);
  await page.getByRole('button', { name: 'Ir para dashboard Real' }).click();

  const realSlide = page.getByTestId('dashboard-slide-real');
  await expect(realSlide.getByText('- R$ 1.000,00')).toBeVisible();

  await page.getByRole('button', { name: /Avan[cç]ar um m[eê]s/i }).click();
  await expect(page.getByText(/abril de 2026/i)).toBeVisible();
  await expect(realSlide.getByText('- R$ 0,00')).toBeVisible();

  await page.getByRole('button', { name: /Voltar um m[eê]s/i }).click();
  await expect(page.getByText(/março de 2026/i)).toBeVisible();
  await expect(realSlide.getByText('- R$ 1.000,00')).toBeVisible();

  await frontend.expectClean();
});
