import { MonthlyProjectionItem, NotificationPreferences, ProjectionReminderConfig } from '@/types/finance';
import { getEffectiveReminderConfig } from '@/lib/projectionTemplateMetadata';

export interface DuePaymentReminder {
  key: string;
  itemId: string;
  templateId: string;
  title: string;
  body: string;
  dueDate: Date;
  triggerDate: Date;
}

const isSameCalendarDay = (left: Date, right: Date) =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate();

const getMonthLastDay = (year: number, month: number) => new Date(year, month + 1, 0).getDate();

export const getDueDateForItem = (year: number, month: number, dueDay: number) =>
  new Date(year, month, Math.min(dueDay, getMonthLastDay(year, month)));

export const getReminderDatesForItem = ({
  item,
  preferences,
  year,
  month,
}: {
  item: Pick<
    MonthlyProjectionItem,
    'status' | 'due_day' | 'reminder_enabled' | 'reminder_days_before' | 'reminder_on_due_date'
  >;
  preferences: NotificationPreferences;
  year: number;
  month: number;
}) => {
  if (item.status === 'paid' || item.status === 'ignored') {
    return [];
  }

  const effectiveConfig = getEffectiveReminderConfig({
    reminder: {
      due_day: item.due_day,
      reminder_enabled: item.reminder_enabled,
      reminder_days_before: item.reminder_days_before,
      reminder_on_due_date: item.reminder_on_due_date,
    } satisfies ProjectionReminderConfig,
    preferences,
  });

  if (!effectiveConfig.enabled || !effectiveConfig.dueDay) {
    return [];
  }

  const dueDate = getDueDateForItem(year, month, effectiveConfig.dueDay);
  const reminderDates = new Map<string, Date>();

  if (effectiveConfig.onDueDate) {
    reminderDates.set(dueDate.toISOString(), dueDate);
  }

  effectiveConfig.daysBefore.forEach((daysBefore) => {
    const reminderDate = new Date(dueDate);
    reminderDate.setDate(reminderDate.getDate() - daysBefore);

    if (reminderDate.getFullYear() === year && reminderDate.getMonth() === month) {
      reminderDates.set(reminderDate.toISOString(), reminderDate);
    }
  });

  return Array.from(reminderDates.values()).sort((left, right) => left.getTime() - right.getTime());
};

export const getDuePaymentReminders = ({
  items,
  preferences,
  date,
}: {
  items: MonthlyProjectionItem[];
  preferences: NotificationPreferences;
  date: Date;
}): DuePaymentReminder[] =>
  items.flatMap((item) => {
    const reminderDates = getReminderDatesForItem({
      item,
      preferences,
      year: date.getFullYear(),
      month: date.getMonth(),
    });

    const dueDate = item.due_day ? getDueDateForItem(date.getFullYear(), date.getMonth(), item.due_day) : null;

    return reminderDates
      .filter((reminderDate) => isSameCalendarDay(reminderDate, date))
      .map((triggerDate) => ({
        key: `${item.id}:${triggerDate.toISOString().slice(0, 10)}`,
        itemId: item.id,
        templateId: item.template_id,
        title: `Lembrete de pagamento: ${item.title}`,
        body: dueDate
          ? `Vence dia ${dueDate.getDate()}. A conta continua pendente até você marcar como paga.`
          : 'Essa conta continua pendente até você marcar como paga.',
        dueDate: dueDate ?? triggerDate,
        triggerDate,
      }));
  });
