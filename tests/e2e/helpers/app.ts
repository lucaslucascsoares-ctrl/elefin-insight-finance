import { expect, Page } from '@playwright/test';
import { mockSupabaseUser } from './mockSupabase';

export const trackFrontendErrors = (page: Page) => {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];

  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text());
    }
  });

  page.on('pageerror', (error) => {
    pageErrors.push(error.message);
  });

  return {
    expectClean: async () => {
      expect(consoleErrors, `Console errors: ${consoleErrors.join('\n')}`).toEqual([]);
      expect(pageErrors, `Page errors: ${pageErrors.join('\n')}`).toEqual([]);
    },
  };
};

export const loginThroughUi = async (page: Page) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Entrar na sua conta/i })).toBeVisible();

  await page.getByPlaceholder('E-mail').fill(mockSupabaseUser.email);
  await page.getByPlaceholder('Senha').fill(mockSupabaseUser.password);
  await page.getByRole('button', { name: /^Entrar$/i }).click();

  await expect(page.getByTestId('dashboard-carousel')).toBeVisible();
  await expect(page.getByText('Painel do mês')).toBeVisible();
};

export const openMainMenu = async (page: Page) => {
  await page.getByRole('button', { name: 'Abrir menu principal' }).click();
};

export const openProjectionPage = async (page: Page) => {
  await openMainMenu(page);
  await page.getByRole('button', { name: 'Projeção de Gastos' }).click();
  await expect(page.getByTestId('projection-list-section')).toBeVisible();
};

export const openMonthProjectionSection = async (page: Page) => {
  const section = page.locator('#projection-section');
  await expect(section).toBeVisible();
  const trigger = section.locator('button[aria-controls="projection-monthly-content"]').first();
  if ((await trigger.getAttribute('aria-expanded')) === 'false') {
    await trigger.click();
  }
  await expect(page.getByText(/Essas são as contas fixas/i)).toBeVisible();
};
