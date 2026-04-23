import { useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { getAuthUserId } from '@/lib/authSession';
import { MonthlyProjectionItem, NotificationPreferences } from '@/types/finance';
import { DEFAULT_NOTIFICATION_PREFERENCES } from '@/lib/projectionTemplateMetadata';
import { getDuePaymentReminders } from '@/lib/paymentReminders';

const getStorageKey = (userId: string) => `elefin:payment-reminders:${userId}`;

const readShownReminderKeys = (userId: string) => {
  if (typeof window === 'undefined') return new Set<string>();

  try {
    const raw = window.localStorage.getItem(getStorageKey(userId));
    if (!raw) return new Set<string>();
    const parsed = JSON.parse(raw) as string[];
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set<string>();
  }
};

const writeShownReminderKeys = (userId: string, keys: Set<string>) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(getStorageKey(userId), JSON.stringify(Array.from(keys)));
};

export function usePaymentReminderNotifications({
  session,
  items,
  preferences,
}: {
  session: Session | null;
  items: MonthlyProjectionItem[];
  preferences: NotificationPreferences | null | undefined;
}) {
  useEffect(() => {
    const userId = getAuthUserId(session);
    const safePreferences = preferences ?? DEFAULT_NOTIFICATION_PREFERENCES;

    if (!userId || typeof window === 'undefined' || !('Notification' in window)) {
      return;
    }

    if (!safePreferences.paymentRemindersEnabled || !safePreferences.channels?.push) {
      return;
    }

    if (Notification.permission !== 'granted') {
      return;
    }

    const today = new Date();
    const reminders = getDuePaymentReminders({
      items,
      preferences: safePreferences,
      date: today,
    });

    if (reminders.length === 0) {
      return;
    }

    try {
      const shownReminderKeys = readShownReminderKeys(userId);
      let changed = false;

      reminders.forEach((reminder) => {
        if (shownReminderKeys.has(reminder.key)) {
          return;
        }

        new Notification(reminder.title, {
          body: reminder.body,
          tag: reminder.key,
        });

        shownReminderKeys.add(reminder.key);
        changed = true;
      });

      if (changed) {
        writeShownReminderKeys(userId, shownReminderKeys);
      }
    } catch (error) {
      console.error('payment-reminders', error);
    }
  }, [items, preferences, session]);
}
