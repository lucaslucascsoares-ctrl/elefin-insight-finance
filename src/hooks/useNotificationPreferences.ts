import { useEffect, useMemo, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { NotificationPreferences } from '@/types/finance';
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  getNotificationPreferencesFromMetadata,
} from '@/lib/projectionTemplateMetadata';

export function useNotificationPreferences(session: Session | null) {
  const derivedPreferences = useMemo(
    () => getNotificationPreferencesFromMetadata(session?.user.user_metadata?.notification_preferences),
    [session],
  );

  const [preferences, setPreferences] = useState<NotificationPreferences>(derivedPreferences);

  useEffect(() => {
    setPreferences(derivedPreferences);
  }, [derivedPreferences]);

  const savePreferences = async (nextPreferences: NotificationPreferences) => {
    const { data, error } = await supabase.auth.updateUser({
      data: {
        ...(session?.user.user_metadata ?? {}),
        notification_preferences: nextPreferences,
      },
    });

    if (!error) {
      setPreferences(
        getNotificationPreferencesFromMetadata(data.user?.user_metadata?.notification_preferences ?? nextPreferences),
      );
    }

    return { error };
  };

  const requestPushPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported' as const;
    }

    if (Notification.permission === 'granted') {
      return 'granted' as const;
    }

    const permission = await Notification.requestPermission();
    return permission;
  };

  return {
    preferences: preferences ?? DEFAULT_NOTIFICATION_PREFERENCES,
    savePreferences,
    requestPushPermission,
  };
}
