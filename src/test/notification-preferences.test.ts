import { describe, expect, it } from 'vitest';
import { getNotificationPreferencesFromMetadata } from '@/lib/projectionTemplateMetadata';

describe('notification preferences metadata', () => {
  it('preserva lista vazia de dias antes quando o usuário desmarca a opção', () => {
    const preferences = getNotificationPreferencesFromMetadata({
      paymentRemindersEnabled: true,
      defaultDaysBefore: [],
      defaultOnDueDate: true,
      channels: {
        push: true,
        email: false,
      },
    });

    expect(preferences.defaultDaysBefore).toEqual([]);
  });
});
