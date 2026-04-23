import { NotificationPreferences, ProjectionReminderConfig } from '@/types/finance';

const TEMPLATE_METADATA_TYPE = 'elefin_projection_template_v1';

interface ProjectionTemplateMetadataPayload {
  _type: typeof TEMPLATE_METADATA_TYPE;
  note: string | null;
  reminder: ProjectionReminderConfig;
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  paymentRemindersEnabled: true,
  defaultDaysBefore: [2],
  defaultOnDueDate: true,
  channels: {
    push: true,
    email: false,
  },
};

export const DEFAULT_PROJECTION_REMINDER_CONFIG: ProjectionReminderConfig = {
  due_day: null,
  reminder_enabled: null,
  reminder_days_before: [],
  reminder_on_due_date: null,
};

const sanitizeDaysBefore = (days: number[] | null | undefined) =>
  Array.from(new Set((days ?? []).filter((day) => Number.isFinite(day) && day > 0))).sort((a, b) => a - b);

const sanitizeDueDay = (dueDay: number | null | undefined) => {
  if (!Number.isFinite(dueDay)) return null;
  const safeDay = Number(dueDay);
  if (safeDay < 1 || safeDay > 31) return null;
  return safeDay;
};

export const buildProjectionReminderConfig = (
  reminder: Partial<ProjectionReminderConfig> | null,
): ProjectionReminderConfig => ({
  due_day: sanitizeDueDay(reminder?.due_day),
  reminder_enabled:
    typeof reminder?.reminder_enabled === 'boolean' ? reminder.reminder_enabled : DEFAULT_PROJECTION_REMINDER_CONFIG.reminder_enabled,
  reminder_days_before: sanitizeDaysBefore(reminder?.reminder_days_before),
  reminder_on_due_date:
    typeof reminder?.reminder_on_due_date === 'boolean'
      ? reminder.reminder_on_due_date
      : DEFAULT_PROJECTION_REMINDER_CONFIG.reminder_on_due_date,
});

export const parseProjectionTemplateDescription = (description: string | null | undefined) => {
  if (!description) {
    return {
      note: null,
      reminder: DEFAULT_PROJECTION_REMINDER_CONFIG,
    };
  }

  try {
    const parsed = JSON.parse(description) as Partial<ProjectionTemplateMetadataPayload>;
    if (parsed && parsed._type === TEMPLATE_METADATA_TYPE) {
      return {
        note: typeof parsed.note === 'string' && parsed.note.trim().length > 0 ? parsed.note : null,
        reminder: buildProjectionReminderConfig(parsed.reminder),
      };
    }
  } catch {
    // fallback below
  }

  return {
    note: description,
    reminder: DEFAULT_PROJECTION_REMINDER_CONFIG,
  };
};

export const serializeProjectionTemplateDescription = ({
  note,
  reminder,
}: {
  note: string | null;
  reminder: ProjectionReminderConfig;
}) =>
  JSON.stringify({
    _type: TEMPLATE_METADATA_TYPE,
    note: note?.trim() || null,
    reminder: buildProjectionReminderConfig(reminder),
  } satisfies ProjectionTemplateMetadataPayload);

export const getNotificationPreferencesFromMetadata = (rawPreferences: unknown): NotificationPreferences => {
  if (!rawPreferences || typeof rawPreferences !== 'object') {
    return DEFAULT_NOTIFICATION_PREFERENCES;
  }

  const candidate = rawPreferences as Partial<NotificationPreferences>;

  return {
    paymentRemindersEnabled:
      typeof candidate.paymentRemindersEnabled === 'boolean'
        ? candidate.paymentRemindersEnabled
        : DEFAULT_NOTIFICATION_PREFERENCES.paymentRemindersEnabled,
    defaultDaysBefore: Array.isArray(candidate.defaultDaysBefore)
      ? sanitizeDaysBefore(candidate.defaultDaysBefore)
      : DEFAULT_NOTIFICATION_PREFERENCES.defaultDaysBefore,
    defaultOnDueDate:
      typeof candidate.defaultOnDueDate === 'boolean'
        ? candidate.defaultOnDueDate
        : DEFAULT_NOTIFICATION_PREFERENCES.defaultOnDueDate,
    channels: {
      push:
        typeof candidate.channels?.push === 'boolean'
          ? candidate.channels.push
          : DEFAULT_NOTIFICATION_PREFERENCES.channels.push,
      email:
        typeof candidate.channels?.email === 'boolean'
          ? candidate.channels.email
          : DEFAULT_NOTIFICATION_PREFERENCES.channels.email,
    },
  };
};

export const getEffectiveReminderConfig = ({
  reminder,
  preferences,
}: {
  reminder: ProjectionReminderConfig;
  preferences: NotificationPreferences | null | undefined;
}) => {
  const safePreferences = preferences ?? DEFAULT_NOTIFICATION_PREFERENCES;

  if (!safePreferences.paymentRemindersEnabled) {
    return {
      dueDay: reminder.due_day,
      enabled: false,
      daysBefore: [] as number[],
      onDueDate: false,
    };
  }

  const enabled =
    reminder.reminder_enabled === null ? safePreferences.paymentRemindersEnabled : reminder.reminder_enabled;

  const daysBefore =
    reminder.reminder_days_before.length > 0 ? reminder.reminder_days_before : safePreferences.defaultDaysBefore;
  const onDueDate =
    reminder.reminder_on_due_date === null ? safePreferences.defaultOnDueDate : reminder.reminder_on_due_date;

  return {
    dueDay: reminder.due_day,
    enabled,
    daysBefore,
    onDueDate,
  };
};
