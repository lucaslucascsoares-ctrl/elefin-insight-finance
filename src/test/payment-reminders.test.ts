import { describe, expect, it } from 'vitest';
import { getDuePaymentReminders, getReminderDatesForItem } from '@/lib/paymentReminders';
import { MonthlyProjectionItem, NotificationPreferences } from '@/types/finance';

const preferences: NotificationPreferences = {
  paymentRemindersEnabled: true,
  defaultDaysBefore: [2],
  defaultOnDueDate: true,
  channels: {
    push: true,
    email: false,
  },
};

const buildItem = (partial: Partial<MonthlyProjectionItem>): MonthlyProjectionItem => ({
  id: 'item-1',
  template_id: 'template-1',
  user_id: 'user-1',
  month: 3,
  year: 2026,
  title: 'Internet',
  account_name: 'Internet',
  category_name: 'Habitação',
  amount: 150,
  category_id: 'cat-1',
  group_type: 'essenciais',
  status: 'predicted',
  paid_transaction_id: null,
  is_overridden: false,
  due_day: 10,
  reminder_enabled: true,
  reminder_days_before: [2],
  reminder_on_due_date: true,
  ...partial,
});

describe('payment reminders', () => {
  it('gera lembrete 2 dias antes quando a conta está com lembrete ativo', () => {
    const reminderDates = getReminderDatesForItem({
      item: buildItem({}),
      preferences,
      year: 2026,
      month: 3,
    });

    expect(reminderDates.map((date) => date.getDate())).toEqual([8, 10]);
  });

  it('não gera lembrete quando a conta está sem lembrete ativo', () => {
    const reminderDates = getReminderDatesForItem({
      item: buildItem({
        reminder_enabled: false,
        reminder_days_before: [2],
        reminder_on_due_date: true,
      }),
      preferences,
      year: 2026,
      month: 3,
    });

    expect(reminderDates).toHaveLength(0);
  });

  it('usa a preferência global quando a conta não define regra própria', () => {
    const reminderDates = getReminderDatesForItem({
      item: buildItem({
        reminder_enabled: null,
        reminder_days_before: [],
        reminder_on_due_date: null,
      }),
      preferences,
      year: 2026,
      month: 3,
    });

    expect(reminderDates.map((date) => date.getDate())).toEqual([8, 10]);
  });

  it('não gera lembrete se a preferência global estiver desativada', () => {
    const reminderDates = getReminderDatesForItem({
      item: buildItem({
        reminder_enabled: null,
        reminder_days_before: [],
        reminder_on_due_date: null,
      }),
      preferences: {
        ...preferences,
        paymentRemindersEnabled: false,
      },
      year: 2026,
      month: 3,
    });

    expect(reminderDates).toHaveLength(0);
  });

  it('retorna lembrete no dia correto do vencimento', () => {
    const reminders = getDuePaymentReminders({
      items: [buildItem({})],
      preferences,
      date: new Date(2026, 3, 10),
    });

    expect(reminders).toHaveLength(1);
    expect(reminders[0].title).toContain('Internet');
  });
});
