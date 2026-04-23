import { expect, test } from '@playwright/test';
import { loginThroughUi, trackFrontendErrors } from './helpers/app';
import { createMockSupabaseState, installMockSupabase } from './helpers/mockSupabase';

test('carrega a página, conclui o login e permanece estável após reload', async ({ page }) => {
  await installMockSupabase(page, createMockSupabaseState());
  const frontend = trackFrontendErrors(page);

  await loginThroughUi(page);
  await expect(page.getByText(/março de 2026/i)).toBeVisible();
  await page.getByRole('button', { name: 'Ir para dashboard Previsão' }).click();
  await expect(page.getByTestId('dashboard-slide-forecast')).toBeVisible();

  await page.reload();

  await expect(page.getByText(/Painel do mes/i)).toBeVisible();
  await expect(page.getByText(/março de 2026/i)).toBeVisible();
  await expect(page.getByTestId('dashboard-carousel')).toBeVisible();
  await page.getByRole('button', { name: 'Ir para dashboard Previsão' }).click();
  await expect(page.getByTestId('dashboard-slide-forecast')).toBeVisible();

  await frontend.expectClean();
});
