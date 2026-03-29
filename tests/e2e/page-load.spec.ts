import { expect, test } from '@playwright/test';
import { loginThroughUi, trackFrontendErrors } from './helpers/app';
import { createMockSupabaseState, installMockSupabase } from './helpers/mockSupabase';

test('carrega a página, conclui o login e permanece estável após reload', async ({ page }) => {
  await installMockSupabase(page, createMockSupabaseState());
  const frontend = trackFrontendErrors(page);

  await loginThroughUi(page);
  await expect(page.getByText(/março de 2026/i)).toBeVisible();
  await expect(page.getByTestId('dashboard-tab-projection')).toBeVisible();
  await expect(page.getByTestId('dashboard-tab-real')).toBeVisible();

  await page.reload();

  await expect(page.getByText('Painel do mês')).toBeVisible();
  await expect(page.getByText(/março de 2026/i)).toBeVisible();
  await expect(page.getByTestId('dashboard-carousel')).toBeVisible();

  await frontend.expectClean();
});
