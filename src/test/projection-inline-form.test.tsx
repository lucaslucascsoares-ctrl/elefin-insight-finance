// @vitest-environment jsdom

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ProjectionInlineForm from '@/components/projection/ProjectionInlineForm';
import type { Category, NotificationPreferences, ProjectionTemplateInput } from '@/types/finance';

const categories: Category[] = [
  { id: 'cat-aluguel', name: 'Aluguel', group_type: 'essenciais', user_id: 'user-1' },
  { id: 'cat-condominio', name: 'Condomínio', group_type: 'essenciais', user_id: 'user-1' },
];

const notificationPreferences: NotificationPreferences = {
  paymentRemindersEnabled: true,
  defaultDaysBefore: [2],
  defaultOnDueDate: true,
  channels: {
    push: true,
    email: false,
  },
};

const renderForm = (onSave = vi.fn()) =>
  render(
    <ProjectionInlineForm
      categories={categories}
      template={null}
      open
      onOpenChange={vi.fn()}
      onCancelEdit={vi.fn()}
      onSave={onSave}
      notificationPreferences={notificationPreferences}
    />,
  );

describe('ProjectionInlineForm', () => {
  it('desabilita a conta até escolher uma categoria e reseta ao trocar categoria', () => {
    renderForm();

    const accountSelect = screen.getByLabelText(/conta vinculada à categoria/i) as HTMLSelectElement;
    const accountInput = screen.getByLabelText(/^conta$/i) as HTMLInputElement;
    expect(accountSelect).toBeDisabled();

    fireEvent.change(screen.getByLabelText(/^categoria$/i), { target: { value: 'Habitação' } });
    expect(accountSelect).not.toBeDisabled();

    fireEvent.change(accountSelect, { target: { value: 'Aluguel' } });
    expect(accountInput.value).toBe('Aluguel');

    fireEvent.change(screen.getByLabelText(/^categoria$/i), { target: { value: 'Outras Necessidades Básicas' } });
    expect(accountSelect.value).toBe('');
    expect(accountInput.value).toBe('');
  });

  it('salva somente quando a conta pertence à categoria selecionada e envia configuração de lembrete', async () => {
    const onSave = vi.fn<(input: ProjectionTemplateInput) => void>();
    renderForm(onSave);

    fireEvent.change(screen.getByLabelText(/^categoria$/i), { target: { value: 'Habitação' } });
    fireEvent.change(screen.getByLabelText(/conta vinculada à categoria/i), { target: { value: 'Aluguel' } });
    fireEvent.change(screen.getByLabelText(/valor padrão/i), { target: { value: '800' } });
    fireEvent.change(screen.getByLabelText(/dia de vencimento/i), { target: { value: '10' } });
    fireEvent.click(screen.getByRole('button', { name: /salvar projeção/i }));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Aluguel',
          account_name: 'Aluguel',
          category_name: 'Habitação',
          default_amount: 800,
          due_day: 10,
          reminder_enabled: true,
          reminder_days_before: [2],
          reminder_on_due_date: true,
        }),
      );
    });
  });
});
