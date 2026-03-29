import { expect, test } from '@playwright/test';
import { loginThroughUi, openProjectionPage, trackFrontendErrors } from './helpers/app';
import { createMockSupabaseState, installMockSupabase } from './helpers/mockSupabase';

test('cria projeção com categoria dependente e reseta a conta ao trocar a categoria', async ({ page }) => {
  await installMockSupabase(page, createMockSupabaseState());
  const frontend = trackFrontendErrors(page);

  await loginThroughUi(page);
  await openProjectionPage(page);

  await page.getByTestId('projection-form-toggle').click();
  await page.getByTestId('projection-category-select').selectOption({ index: 1 });
  await page.getByTestId('projection-account-select').selectOption({ index: 1 });
  await expect(page.getByTestId('projection-account-input')).toHaveValue('Aluguel');

  await page.getByTestId('projection-category-select').selectOption({ index: 2 });
  await expect(page.getByTestId('projection-account-select')).toHaveValue('');
  await expect(page.getByTestId('projection-account-input')).toHaveValue('');

  await page.getByTestId('projection-category-select').selectOption({ index: 1 });
  await page.getByTestId('projection-account-select').selectOption({ index: 1 });
  await page.getByTestId('projection-amount-input').fill('800');
  await page.getByTestId('projection-due-day-input').fill('10');
  await page.getByTestId('projection-form-save').click();

  await expect(page.getByTestId('projection-list-section').getByText('Aluguel')).toBeVisible();
  await expect(page.getByTestId('projection-list-section').getByText('R$ 800,00')).toBeVisible();

  await page.reload();
  await expect(page.getByTestId('projection-list-section').getByText('Aluguel')).toBeVisible();
  await page.getByTestId('projection-list-section').locator('button').first().click();
  await page.getByTestId('projection-amount-input').fill('950');
  await page.getByTestId('projection-form-save').click();
  await expect(page.getByTestId('projection-list-section').getByText('R$ 950,00')).toBeVisible();

  await frontend.expectClean();
});
