// @vitest-environment jsdom

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ProjectionInlineForm from '@/components/projection/ProjectionInlineForm';
import type { Category, ProjectionTemplateInput } from '@/types/finance';

const categories: Category[] = [
  { id: 'cat-aluguel', name: 'Aluguel', group_type: 'essenciais', user_id: 'user-1' },
  { id: 'cat-condominio', name: 'Condominio', group_type: 'essenciais', user_id: 'user-1' },
];

const renderForm = (onSave = vi.fn()) =>
  render(
    <ProjectionInlineForm
      categories={categories}
      template={null}
      open
      onOpenChange={vi.fn()}
      onCancelEdit={vi.fn()}
      onSave={onSave}
    />,
  );

describe('ProjectionInlineForm', () => {
  it('desabilita a conta até escolher uma categoria e reseta ao trocar categoria', () => {
    renderForm();

    const accountSelect = screen.getByLabelText(/conta vinculada a categoria/i) as HTMLSelectElement;
    const accountInput = screen.getByLabelText(/^conta$/i) as HTMLInputElement;
    expect(accountSelect).toBeDisabled();

    fireEvent.change(screen.getByLabelText(/^categoria$/i), { target: { value: 'Habitacao' } });
    expect(accountSelect).not.toBeDisabled();

    fireEvent.change(accountSelect, { target: { value: 'Aluguel' } });
    expect(accountInput.value).toBe('Aluguel');

    fireEvent.change(screen.getByLabelText(/^categoria$/i), { target: { value: 'Alimentacao Essencial' } });
    expect(accountSelect.value).toBe('');
    expect(accountInput.value).toBe('');
  });

  it('salva somente quando a conta pertence a categoria selecionada', () => {
    const onSave = vi.fn<(input: ProjectionTemplateInput) => void>();
    renderForm(onSave);

    fireEvent.change(screen.getByLabelText(/^categoria$/i), { target: { value: 'Habitacao' } });
    fireEvent.change(screen.getByLabelText(/conta vinculada a categoria/i), { target: { value: 'Aluguel' } });
    fireEvent.change(screen.getByLabelText(/valor padrao/i), { target: { value: '800' } });
    fireEvent.click(screen.getByRole('button', { name: /salvar projeção/i }));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Aluguel',
        account_name: 'Aluguel',
        category_name: 'Habitacao',
        default_amount: 800,
      }),
    );
  });
});
