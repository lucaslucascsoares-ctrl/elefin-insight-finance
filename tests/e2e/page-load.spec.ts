import { expect, test } from '@playwright/test';
import { loginThroughUi, trackFrontendErrors } from './helpers/app';
import { createMockSupabaseState, installMockSupabase } from './helpers/mockSupabase';

test('carrega a página, conclui o login e permanece estável após reload', async ({ page }) => {
  await installMockSupabase(page, createMockSupabaseState());
  const frontend = trackFrontendErrors(page);

  await loginThroughUi(page);
  await expect(page.getByText(/março de 2026/i)).toBeVisible();
  await expect(page.getByText(/Essenciais/i).first()).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth))
    .toBe(true);
  await page.getByRole('button', { name: 'Ir para dashboard Previsão' }).click();
  await expect(page.getByTestId('dashboard-slide-forecast')).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth))
    .toBe(true);
  await page.getByTestId('forecast-month-detail-trigger').click();
  await expect(page.getByText(/Composição da previsão/i)).toBeVisible();
  await expect(page.getByText(/Evolução diária/i)).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth))
    .toBe(true);

  await page.reload();

  await expect(page.getByText(/Resumo financeiro/i)).toBeVisible();
  await expect(page.getByText(/março de 2026/i)).toBeVisible();
  await expect(page.getByTestId('dashboard-carousel')).toBeVisible();
  await page.getByRole('button', { name: 'Ir para dashboard Previsão' }).click();
  await expect(page.getByTestId('dashboard-slide-forecast')).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth))
    .toBe(true);

  await frontend.expectClean();
});
